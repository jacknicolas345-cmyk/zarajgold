import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";
import { api, formatPrice, formatApiErrorDetail } from "../lib/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) { nav("/login?next=/checkout"); return null; }
  if (items.length === 0) { nav("/cart"); return null; }

  const submit = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      toast.error("لطفاً آدرس و شماره تماس را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        origin_url: window.location.origin,
        address,
        phone,
      };
      const { data } = await api.post("/checkout/session", payload);
      window.location.href = data.url;
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 fade-in" data-testid="checkout-page">
      <div className="overline mb-3">پرداخت</div>
      <h1 className="text-3xl font-light mb-10">تکمیل سفارش</h1>

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6 bg-white p-8 border border-border rounded-sm">
          <div>
            <label className="text-sm font-medium block mb-2">نام تحویل‌گیرنده</label>
            <Input value={user.name} disabled />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">ایمیل</label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">شماره تماس</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="۰۹۱۲xxxxxxx" data-testid="phone-input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">آدرس کامل</label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={4} placeholder="استان، شهر، خیابان، کد پستی" data-testid="address-input" />
          </div>
          <div className="text-xs text-slate-500">پرداخت امن از طریق درگاه Stripe انجام می‌شود.</div>
        </div>

        <aside className="bg-white border border-border rounded-sm p-6 h-fit">
          <div className="overline mb-4">سفارش شما</div>
          <div className="space-y-3 max-h-80 overflow-auto">
            {items.map((i) => (
              <div key={i.product_id} className="flex items-center gap-3 text-sm">
                <img src={i.image} alt="" className="w-12 h-12 object-cover rounded-sm" />
                <div className="flex-1">
                  <div className="line-clamp-1">{i.name}</div>
                  <div className="text-slate-500 text-xs">× {i.quantity}</div>
                </div>
                <div className="font-medium">{formatPrice(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between text-lg font-semibold">
            <span>مجموع</span>
            <span className="text-gold">{formatPrice(total)}</span>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full mt-6 disabled:opacity-60" data-testid="pay-btn">
            {loading ? "در حال انتقال..." : "پرداخت امن"}
          </button>
        </aside>
      </form>
    </div>
  );
}
