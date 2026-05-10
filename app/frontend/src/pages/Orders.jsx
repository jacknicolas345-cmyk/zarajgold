import React, { useEffect, useState } from "react";
import { api, formatPrice } from "../lib/api";

const STATUS_FA = {
  pending: "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل داده شد",
  cancelled: "لغو شده",
};
const PAYMENT_FA = { paid: "پرداخت شد", initiated: "در انتظار", expired: "منقضی" };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 fade-in" data-testid="orders-page">
      <div className="overline mb-3">حساب من</div>
      <h1 className="text-3xl font-light mb-10">سفارش‌های من</h1>

      {loading ? <div className="text-slate-500">در حال بارگذاری...</div> :
        orders.length === 0 ? <div className="text-slate-500">هنوز سفارشی ثبت نکرده‌اید.</div> :
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-border rounded-sm p-5" data-testid={`order-${o.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="text-xs text-slate-500">کد سفارش: {o.id.slice(0, 8)}</div>
                <div className="text-xs">{new Date(o.created_at).toLocaleDateString("fa-IR")}</div>
                <div className="text-xs px-3 py-1 bg-gold/10 text-gold rounded-full">{STATUS_FA[o.status] || o.status}</div>
                <div className="text-xs text-slate-500">{PAYMENT_FA[o.payment_status] || o.payment_status}</div>
              </div>
              <div className="mt-3 space-y-2">
                {o.items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <img src={i.image} alt="" className="w-10 h-10 object-cover rounded-sm" />
                    <div className="flex-1">{i.name} × {i.quantity}</div>
                    <div className="font-medium">{formatPrice(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end text-lg text-gold font-semibold">{formatPrice(o.total)}</div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
