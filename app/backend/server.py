"from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)

# ------------------ Setup ------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(\"zarajgold\")

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title=\"Zaraj Gold API\")
api = APIRouter(prefix=\"/api\")

JWT_ALGO = \"HS256\"
JWT_SECRET = os.environ[\"JWT_SECRET\"]
STRIPE_KEY = os.environ.get(\"STRIPE_API_KEY\", \"sk_test_emergent\")

# ------------------ Models ------------------
class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str = \"user\"

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProductIn(BaseModel):
    name: str
    description: str
    price: float
    category: str  # ring | necklace | bracelet | earring | other
    material: str = \"gold\"  # gold | silver
    karat: Optional[str] = None  # 18K, 24K...
    weight: Optional[float] = None  # grams
    has_gemstone: bool = False
    image: str
    images: List[str] = []
    stock: int = 10
    featured: bool = False

class Product(ProductIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CartItem(BaseModel):
    product_id: str
    quantity: int

class CheckoutIn(BaseModel):
    items: List[CartItem]
    origin_url: str
    address: str
    phone: str

class OrderOut(BaseModel):
    id: str
    user_email: str
    items: list
    total: float
    status: str
    payment_status: str
    address: str
    phone: str
    created_at: str
    session_id: Optional[str] = None

# ------------------ Helpers ------------------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        \"sub\": user_id,
        \"email\": email,
        \"role\": role,
        \"exp\": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def set_auth_cookie(resp: Response, token: str):
    resp.set_cookie(
        key=\"access_token\",
        value=token,
        httponly=True,
        secure=False,
        samesite=\"lax\",
        max_age=604800,
        path=\"/\",
    )

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get(\"access_token\")
    if not token:
        auth = request.headers.get(\"Authorization\", \"\")
        if auth.startswith(\"Bearer \"):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail=\"احراز هویت نشده\")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user = await db.users.find_one({\"id\": payload[\"sub\"]}, {\"_id\": 0, \"password_hash\": 0})
        if not user:
            raise HTTPException(status_code=401, detail=\"کاربر یافت نشد\")
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"توکن منقضی شده\")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=\"توکن نامعتبر\")

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get(\"role\") != \"admin\":
        raise HTTPException(status_code=403, detail=\"دسترسی فقط برای ادمین\")
    return user

# ------------------ Auth ------------------
@api.post(\"/auth/register\", response_model=UserOut)
async def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    if await db.users.find_one({\"email\": email}):
        raise HTTPException(status_code=400, detail=\"ایمیل قبلاً ثبت شده است\")
    user_id = str(uuid.uuid4())
    doc = {
        \"id\": user_id,
        \"email\": email,
        \"name\": data.name,
        \"role\": \"user\",
        \"password_hash\": hash_password(data.password),
        \"created_at\": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email, \"user\")
    set_auth_cookie(response, token)
    return UserOut(id=user_id, email=email, name=data.name, role=\"user\")

@api.post(\"/auth/login\", response_model=UserOut)
async def login(data: LoginIn, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({\"email\": email})
    if not user or not verify_password(data.password, user[\"password_hash\"]):
        raise HTTPException(status_code=401, detail=\"ایمیل یا رمز عبور اشتباه است\")
    token = create_token(user[\"id\"], user[\"email\"], user.get(\"role\", \"user\"))
    set_auth_cookie(response, token)
    return UserOut(id=user[\"id\"], email=user[\"email\"], name=user[\"name\"], role=user.get(\"role\", \"user\"))

@api.post(\"/auth/logout\")
async def logout(response: Response):
    response.delete_cookie(\"access_token\", path=\"/\")
    return {\"ok\": True}

@api.get(\"/auth/me\", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user[\"id\"], email=user[\"email\"], name=user[\"name\"], role=user.get(\"role\", \"user\"))

# ------------------ Products ------------------
@api.get(\"/products\", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    material: Optional[str] = None,
    has_gemstone: Optional[bool] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    q: Optional[str] = None,
):
    query = {}
    if category: query[\"category\"] = category
    if material: query[\"material\"] = material
    if has_gemstone is not None: query[\"has_gemstone\"] = has_gemstone
    if featured is not None: query[\"featured\"] = featured
    price_q = {}
    if min_price is not None: price_q[\"$gte\"] = min_price
    if max_price is not None: price_q[\"$lte\"] = max_price
    if price_q: query[\"price\"] = price_q
    if q: query[\"name\"] = {\"$regex\": q, \"$options\": \"i\"}
    items = await db.products.find(query, {\"_id\": 0}).sort(\"created_at\", -1).to_list(500)
    return items

@api.get(\"/products/{pid}\", response_model=Product)
async def get_product(pid: str):
    p = await db.products.find_one({\"id\": pid}, {\"_id\": 0})
    if not p:
        raise HTTPException(404, \"محصول یافت نشد\")
    return p

# ------------------ Admin ------------------
@api.post(\"/admin/products\", response_model=Product)
async def create_product(data: ProductIn, _admin=Depends(require_admin)):
    p = Product(**data.model_dump())
    await db.products.insert_one(p.model_dump())
    return p

@api.put(\"/admin/products/{pid}\", response_model=Product)
async def update_product(pid: str, data: ProductIn, _admin=Depends(require_admin)):
    existing = await db.products.find_one({\"id\": pid}, {\"_id\": 0})
    if not existing:
        raise HTTPException(404, \"محصول یافت نشد\")
    updated = {**existing, **data.model_dump()}
    await db.products.update_one({\"id\": pid}, {\"$set\": data.model_dump()})
    return updated

@api.delete(\"/admin/products/{pid}\")
async def delete_product(pid: str, _admin=Depends(require_admin)):
    r = await db.products.delete_one({\"id\": pid})
    if r.deleted_count == 0:
        raise HTTPException(404, \"محصول یافت نشد\")
    return {\"ok\": True}

@api.get(\"/admin/orders\")
async def admin_orders(_admin=Depends(require_admin)):
    return await db.orders.find({}, {\"_id\": 0}).sort(\"created_at\", -1).to_list(1000)

@api.put(\"/admin/orders/{oid}/status\")
async def admin_update_order(oid: str, body: dict, _admin=Depends(require_admin)):
    status = body.get(\"status\")
    if status not in (\"pending\", \"processing\", \"shipped\", \"delivered\", \"cancelled\"):
        raise HTTPException(400, \"وضعیت نامعتبر\")
    r = await db.orders.update_one({\"id\": oid}, {\"$set\": {\"status\": status}})
    if r.matched_count == 0:
        raise HTTPException(404, \"سفارش یافت نشد\")
    return {\"ok\": True}

@api.get(\"/admin/users\")
async def admin_users(_admin=Depends(require_admin)):
    users = await db.users.find({}, {\"_id\": 0, \"password_hash\": 0}).to_list(1000)
    return users

@api.get(\"/admin/stats\")
async def admin_stats(_admin=Depends(require_admin)):
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    paid_orders = await db.orders.find({\"payment_status\": \"paid\"}, {\"_id\": 0, \"total\": 1}).to_list(10000)
    revenue = sum(o.get(\"total\", 0) for o in paid_orders)
    return {
        \"products\": total_products,
        \"orders\": total_orders,
        \"users\": total_users,
        \"revenue\": round(revenue, 2),
    }

# ------------------ Orders ------------------
@api.get(\"/orders\")
async def my_orders(user: dict = Depends(get_current_user)):
    return await db.orders.find({\"user_email\": user[\"email\"]}, {\"_id\": 0}).sort(\"created_at\", -1).to_list(200)

# ------------------ Checkout ------------------
@api.post(\"/checkout/session\")
async def create_checkout(data: CheckoutIn, request: Request, user: dict = Depends(get_current_user)):
    # Compute total from backend-stored prices (security)
    if not data.items:
        raise HTTPException(400, \"سبد خرید خالی است\")

    product_ids = [i.product_id for i in data.items]
    products = await db.products.find({\"id\": {\"$in\": product_ids}}, {\"_id\": 0}).to_list(500)
    price_map = {p[\"id\"]: p for p in products}

    total = 0.0
    line_items = []
    for item in data.items:
        p = price_map.get(item.product_id)
        if not p:
            raise HTTPException(400, f\"محصول {item.product_id} یافت نشد\")
        qty = max(1, int(item.quantity))
        line_total = float(p[\"price\"]) * qty
        total += line_total
        line_items.append({
            \"product_id\": p[\"id\"],
            \"name\": p[\"name\"],
            \"price\": float(p[\"price\"]),
            \"quantity\": qty,
            \"image\": p.get(\"image\", \"\"),
        })
    total = round(total, 2)

    webhook_url = f\"{str(request.base_url).rstrip('/')}/api/webhook/stripe\"
    stripe = StripeCheckout(api_key=STRIPE_KEY, webhook_url=webhook_url)

    origin = data.origin_url.rstrip(\"/\")
    success_url = f\"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}\"
    cancel_url = f\"{origin}/cart\"

    order_id = str(uuid.uuid4())
    req = CheckoutSessionRequest(
        amount=float(total),
        currency=\"usd\",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={\"order_id\": order_id, \"user_email\": user[\"email\"]},
    )
    session = await stripe.create_checkout_session(req)

    order_doc = {
        \"id\": order_id,
        \"user_email\": user[\"email\"],
        \"items\": line_items,
        \"total\": total,
        \"status\": \"pending\",
        \"payment_status\": \"initiated\",
        \"address\": data.address,
        \"phone\": data.phone,
        \"session_id\": session.session_id,
        \"created_at\": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order_doc)

    await db.payment_transactions.insert_one({
        \"id\": str(uuid.uuid4()),
        \"session_id\": session.session_id,
        \"order_id\": order_id,
        \"user_email\": user[\"email\"],
        \"amount\": total,
        \"currency\": \"usd\",
        \"payment_status\": \"initiated\",
        \"metadata\": {\"order_id\": order_id, \"user_email\": user[\"email\"]},
        \"created_at\": datetime.now(timezone.utc).isoformat(),
    })

    return {\"url\": session.url, \"session_id\": session.session_id, \"order_id\": order_id}

@api.get(\"/checkout/status/{session_id}\")
async def checkout_status(session_id: str, request: Request):
    webhook_url = f\"{str(request.base_url).rstrip('/')}/api/webhook/stripe\"
    stripe = StripeCheckout(api_key=STRIPE_KEY, webhook_url=webhook_url)
    status = await stripe.get_checkout_status(session_id)

    txn = await db.payment_transactions.find_one({\"session_id\": session_id}, {\"_id\": 0})
    if txn and txn.get(\"payment_status\") != \"paid\":
        if status.payment_status == \"paid\":
            await db.payment_transactions.update_one(
                {\"session_id\": session_id},
                {\"$set\": {\"payment_status\": \"paid\", \"updated_at\": datetime.now(timezone.utc).isoformat()}},
            )
            await db.orders.update_one(
                {\"session_id\": session_id},
                {\"$set\": {\"payment_status\": \"paid\", \"status\": \"processing\"}},
            )
        elif status.status == \"expired\":
            await db.payment_transactions.update_one(
                {\"session_id\": session_id},
                {\"$set\": {\"payment_status\": \"expired\"}},
            )
            await db.orders.update_one(
                {\"session_id\": session_id},
                {\"$set\": {\"payment_status\": \"expired\", \"status\": \"cancelled\"}},
            )
    return {
        \"status\": status.status,
        \"payment_status\": status.payment_status,
        \"amount_total\": status.amount_total,
        \"currency\": status.currency,
    }

@api.post(\"/webhook/stripe\")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get(\"Stripe-Signature\", \"\")
    webhook_url = f\"{str(request.base_url).rstrip('/')}/api/webhook/stripe\"
    stripe = StripeCheckout(api_key=STRIPE_KEY, webhook_url=webhook_url)
    try:
        event = await stripe.handle_webhook(body, sig)
        if event.payment_status == \"paid\":
            await db.payment_transactions.update_one(
                {\"session_id\": event.session_id},
                {\"$set\": {\"payment_status\": \"paid\"}},
            )
            await db.orders.update_one(
                {\"session_id\": event.session_id},
                {\"$set\": {\"payment_status\": \"paid\", \"status\": \"processing\"}},
            )
    except Exception as e:
        logger.error(f\"webhook error: {e}\")
    return {\"received\": True}

# ------------------ Include router ------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[\"*\"],
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# ------------------ Startup ------------------
SAMPLE_PRODUCTS = [
    {\"name\": \"انگشتر طلا سولیتر کلاسیک\", \"description\": \"انگشتر طلای ۱۸ عیار با طراحی کلاسیک سولیتر مناسب برای هدیه و مراسم نامزدی.\", \"price\": 480.00, \"category\": \"ring\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 3.2, \"has_gemstone\": True, \"image\": \"https://images.unsplash.com/photo-1593554448506-20c695dd738a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 8, \"featured\": True},
    {\"name\": \"انگشتر طلا مینیمال لوپ\", \"description\": \"انگشتر طلای ۱۸ عیار مینیمال با طراحی ساده و شیک برای استفاده روزانه.\", \"price\": 320.00, \"category\": \"ring\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 2.1, \"has_gemstone\": False, \"image\": \"https://images.unsplash.com/photo-1605100804763-247f67b3557e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 15, \"featured\": True},
    {\"name\": \"گردنبند طلا آویز گل\", \"description\": \"گردنبند ظریف طلای ۱۸ عیار با آویز طرح گل، انتخابی عالی برای هدیه.\", \"price\": 620.00, \"category\": \"necklace\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 4.0, \"has_gemstone\": False, \"image\": \"https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 6, \"featured\": True},
    {\"name\": \"گردنبند طلا پلاک قلب\", \"description\": \"گردنبند طلای زنانه با پلاک قلب، ظریف و شیک.\", \"price\": 540.00, \"category\": \"necklace\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 3.5, \"has_gemstone\": False, \"image\": \"https://images.unsplash.com/photo-1611652022419-a9419f74343d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 10, \"featured\": False},
    {\"name\": \"گوشواره طلا میخی مروارید\", \"description\": \"گوشواره میخی طلای ۱۸ عیار با نگین مروارید طبیعی.\", \"price\": 280.00, \"category\": \"earring\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 1.8, \"has_gemstone\": True, \"image\": \"https://images.unsplash.com/photo-1761479267937-4c5c7a903760?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 20, \"featured\": True},
    {\"name\": \"گوشواره طلا حلقه‌ای\", \"description\": \"گوشواره حلقه‌ای کلاسیک طلای ۱۸ عیار.\", \"price\": 360.00, \"category\": \"earring\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 2.4, \"has_gemstone\": False, \"image\": \"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 12, \"featured\": False},
    {\"name\": \"دستبند طلا زنجیری\", \"description\": \"دستبند ظریف طلای ۱۸ عیار با طرح زنجیر و بست ایمن.\", \"price\": 450.00, \"category\": \"bracelet\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 3.0, \"has_gemstone\": False, \"image\": \"https://images.unsplash.com/photo-1599643477877-530eb83abc8e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 9, \"featured\": True},
    {\"name\": \"دستبند طلا پروانه\", \"description\": \"دستبند طلا با آویز پروانه، هدیه‌ای زیبا برای عزیزان.\", \"price\": 510.00, \"category\": \"bracelet\", \"material\": \"gold\", \"karat\": \"18K\", \"weight\": 3.3, \"has_gemstone\": True, \"image\": \"https://images.unsplash.com/photo-1611085583191-a3b181a88401?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 7, \"featured\": False},
    {\"name\": \"انگشتر نقره طرح‌دار\", \"description\": \"انگشتر نقره ۹۲۵ با طراحی دست‌ساز و فاخر.\", \"price\": 95.00, \"category\": \"ring\", \"material\": \"silver\", \"karat\": \"925\", \"weight\": 4.5, \"has_gemstone\": True, \"image\": \"https://images.unsplash.com/photo-1603974372039-adc49044b6bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 25, \"featured\": False},
    {\"name\": \"گردنبند نقره ماه\", \"description\": \"گردنبند نقره ۹۲۵ با آویز ماه، مدرن و مینیمال.\", \"price\": 75.00, \"category\": \"necklace\", \"material\": \"silver\", \"karat\": \"925\", \"weight\": 2.8, \"has_gemstone\": False, \"image\": \"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=srgb&fm=jpg&q=85&w=800\", \"stock\": 18, \"featured\": False},
]

@app.on_event(\"startup\")
async def on_startup():
    # Indexes
    await db.users.create_index(\"email\", unique=True)
    await db.products.create_index(\"id\", unique=True)
    await db.orders.create_index(\"id\", unique=True)
    await db.payment_transactions.create_index(\"session_id\")

    # Seed admin
    admin_email = os.environ[\"ADMIN_EMAIL\"].lower()
    admin_password = os.environ[\"ADMIN_PASSWORD\"]
    existing = await db.users.find_one({\"email\": admin_email})
    if not existing:
        await db.users.insert_one({
            \"id\": str(uuid.uuid4()),
            \"email\": admin_email,
            \"name\": \"مدیر\",
            \"role\": \"admin\",
            \"password_hash\": hash_password(admin_password),
            \"created_at\": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f\"Seeded admin: {admin_email}\")

    # Seed products
    count = await db.products.count_documents({})
    if count == 0:
        for s in SAMPLE_PRODUCTS:
            p = Product(**s)
            await db.products.insert_one(p.model_dump())
        logger.info(\"Seeded sample products\")

@app.on_event(\"shutdown\")
async def on_shutdown():
    client.close()
"
