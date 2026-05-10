import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../lib/CartContext";
import { formatPrice } from "../lib/api";
import { Plus, Minus, X, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, updateQty, remove, total, count } = useCart();
  const nav = useNavigate();

  if (count === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center fade-in" data-testid="empty-cart">
        <ShoppingBag className="w-14 h-14 text-gold mx-auto mb-6" />
        <h1 className="text-2xl font-medium">سبد خرید شما خالی است</h1>
        <p className="text-slate-500 mt-3">محصولات مورد علاقه خود را از فروشگاه انتخاب کنید.</p>
        <Link to="/shop" className="btn-gold inline-block mt-8">مشاهده فروشگاه</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 fade-in" data-testid="cart-page">
      <div className="overline mb-3">سبد خرید</div>
      <h1 className="text-3xl font-light mb-10">سبد خرید شما</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.product_id} className="flex gap-4 bg-white border border-border p-4 rounded-sm" data-testid={`cart-item-${i.product_id}`}>
              <img src={i.image} alt={i.name} className="w-24 h-24 object-cover rounded-sm" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium">{i.name}</h3>
                  <button onClick={() => remove(i.product_id)} className="text-slate-400 hover:text-red-500" data-testid={`remove-${i.product_id}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gold mt-1">{formatPrice(i.price)}</div>
                <div className="mt-3 flex items-center border border-border rounded-sm w-fit">
                  <button onClick={() => updateQty(i.product_id, i.quantity - 1)} className="p-2 hover:bg-gold/10">
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="w-10 text-center text-sm">{i.quantity}</div>
                  <button onClick={() => updateQty(i.product_id, i.quantity + 1)} className="p-2 hover:bg-gold/10">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold self-end">{formatPrice(i.price * i.quantity)}</div>
            </div>
          ))}
        </div>

        <aside className="bg-white border border-border p-6 rounded-sm h-fit sticky top-28">
          <div className="overline mb-4">خلاصه سفارش</div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>تعداد اقلام</span><span>{count}</span></div>
            <div className="flex justify-between"><span>جمع کل</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between text-slate-500"><span>هزینه ارسال</span><span>رایگان</span></div>
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between text-lg font-semibold">
            <span>مبلغ قابل پرداخت</span>
            <span className="text-gold">{formatPrice(total)}</span>
          </div>
          <button onClick={() => nav("/checkout")} className="btn-gold w-full mt-6" data-testid="checkout-btn">
            تکمیل خرید
          </button>
        </aside>
      </div>
    </div>
  );
}
