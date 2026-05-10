import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, CATEGORY_FA } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { ArrowLeft, Shield, Sparkles, Truck } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1762522928601-862bf2a04902?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800";
const STORE = "https://images.unsplash.com/photo-1775021723698-b9afeaa084d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400";

const CATS = [
  { key: "ring", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?crop=entropy&cs=srgb&fm=jpg&q=85&w=600" },
  { key: "necklace", img: "https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?crop=entropy&cs=srgb&fm=jpg&q=85&w=600" },
  { key: "earring", img: "https://images.unsplash.com/photo-1761479267937-4c5c7a903760?crop=entropy&cs=srgb&fm=jpg&q=85&w=600" },
  { key: "bracelet", img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?crop=entropy&cs=srgb&fm=jpg&q=85&w=600" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    api.get("/products", { params: { featured: true } }).then((r) => setFeatured(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in" data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[85vh]">
          <div className="order-2 md:order-1 flex items-center px-6 sm:px-12 lg:px-20 py-20">
            <div className="max-w-xl slide-up">
              <div className="overline mb-5">مجموعه زمستان ۱۴۰۳</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-slate-900">
                زیبایی ماندگار در <span className="text-gold italic">طلای</span> اصیل
              </h1>
              <p className="mt-6 text-base leading-relaxed text-slate-600">
                مجموعه‌ای از دستسازه‌های ظریف طلا و نقره با طراحی مینیمال، ساخته‌شده برای روزهای خاص زندگی شما.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link to="/shop" className="btn-gold inline-flex items-center gap-2" data-testid="hero-shop-btn">
                  کاوش در فروشگاه <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link to="/about" className="text-sm link-hover text-slate-700">داستان ما</Link>
              </div>
              <div className="mt-12 flex items-center gap-8 text-xs text-slate-500">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /> ضمانت اصالت</div>
                <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-gold" /> ارسال سریع</div>
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> دست‌ساز</div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 relative">
            <img src={HERO} alt="hero" className="absolute inset-0 w-full h-full object-cover hero-img" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-cream/60" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="overline mb-3">دسته‌بندی‌ها</div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium">انتخاب کنید بر اساس سلیقه</h2>
          </div>
          <Link to="/shop" className="text-sm link-hover hidden sm:inline-block text-gold">همه محصولات</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATS.map((c) => (
            <Link
              key={c.key}
              to={`/shop?category=${c.key}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm border border-border"
              data-testid={`cat-${c.key}`}
            >
              <img src={c.img} alt={c.key} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-5 right-5 text-white">
                <div className="text-xs tracking-widest opacity-80">مجموعه</div>
                <div className="text-xl font-medium">{CATEGORY_FA[c.key]}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="overline mb-3">منتخب فصل</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium">پرفروش‌ترین‌های ما</h2>
            </div>
            <Link to="/shop" className="text-sm link-hover text-gold">مشاهده همه</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-24 grid md:grid-cols-2 gap-14 items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-sm">
          <img src={STORE} alt="store" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="overline mb-4">درباره زَرَج گُلد</div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight">
            جواهری که <em className="text-gold not-italic">قصه</em> دارد
          </h2>
          <p className="mt-6 text-slate-600 leading-loose">
            بیش از دو دهه است که با عشق و وسواس طلا می‌سازیم. هر قطعه در کارگاه ما، با دست طراحان مجرب خلق می‌شود
            و پیش از رسیدن به دست شما، استاندارد سخت‌گیرانه اصالت را پشت سر می‌گذارد.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-light text-gold">+۲۰</div>
              <div className="text-xs text-slate-500 mt-1">سال تجربه</div>
            </div>
            <div>
              <div className="text-3xl font-light text-gold">۱۲K+</div>
              <div className="text-xs text-slate-500 mt-1">مشتری خوشحال</div>
            </div>
            <div>
              <div className="text-3xl font-light text-gold">۵۰۰+</div>
              <div className="text-xs text-slate-500 mt-1">طرح منحصربه‌فرد</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
