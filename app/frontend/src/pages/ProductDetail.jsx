import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, formatPrice, CATEGORY_FA, MATERIAL_FA } from "../lib/api";
import { useCart } from "../lib/CartContext";
import { toast } from "sonner";
import { Plus, Minus, ShieldCheck, Truck, Award } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setP(r.data)).catch(() => setP(false));
  }, [id]);

  if (p === null) return <div className="py-24 text-center text-slate-500">در حال بارگذاری...</div>;
  if (p === false) return <div className="py-24 text-center text-slate-500">محصول یافت نشد</div>;

  const addToCart = () => {
    add(p, qty);
    toast.success(`${p.name} به سبد اضافه شد`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 fade-in" data-testid="product-detail">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-[#F5EDD9]/30 aspect-square overflow-hidden rounded-sm">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="overline mb-3">{CATEGORY_FA[p.category]} · {MATERIAL_FA[p.material]}</div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">{p.name}</h1>
          <div className="mt-5 text-3xl text-gold font-semibold">{formatPrice(p.price)}</div>

          <p className="mt-6 text-slate-600 leading-loose">{p.description}</p>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {p.karat && (
              <div className="border border-border rounded-sm p-3">
                <div className="text-[10px] text-slate-500 tracking-widest">عیار</div>
                <div className="text-sm mt-1 font-medium">{p.karat}</div>
              </div>
            )}
            {p.weight && (
              <div className="border border-border rounded-sm p-3">
                <div className="text-[10px] text-slate-500 tracking-widest">وزن</div>
                <div className="text-sm mt-1 font-medium">{p.weight} گرم</div>
              </div>
            )}
            <div className="border border-border rounded-sm p-3">
              <div className="text-[10px] text-slate-500 tracking-widest">نگین</div>
              <div className="text-sm mt-1 font-medium">{p.has_gemstone ? "دارد" : "ندارد"}</div>
            </div>
          </div>

          {/* Qty */}
          <div className="mt-8 flex items-center gap-5">
            <div className="flex items-center border border-border rounded-sm">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-gold/10" data-testid="qty-minus">
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 text-center" data-testid="qty-display">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-gold/10" data-testid="qty-plus">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button onClick={addToCart} className="btn-gold flex-1" data-testid="add-to-cart-btn">افزودن به سبد</button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold" /> ضمانت اصالت</div>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-gold" /> ارسال امن</div>
            <div className="flex items-center gap-2"><Award className="w-4 h-4 text-gold" /> کیفیت تضمینی</div>
          </div>
        </div>
      </div>
    </div>
  );
}
