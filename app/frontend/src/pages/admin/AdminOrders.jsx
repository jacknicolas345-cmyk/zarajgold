import React, { useEffect, useState } from "react";
import { api, formatPrice } from "../../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner";

const STATUSES = [
  { v: "pending", l: "در انتظار" },
  { v: "processing", l: "در حال پردازش" },
  { v: "shipped", l: "ارسال شده" },
  { v: "delivered", l: "تحویل شد" },
  { v: "cancelled", l: "لغو" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/admin/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success("به‌روزرسانی شد"); load();
    } catch (e) { toast.error("خطا در به‌روزرسانی"); }
  };

  return (
    <div data-testid="admin-orders">
      <div className="overline mb-1">سفارش‌ها</div>
      <div className="text-slate-600 text-sm mb-5">{orders.length} سفارش</div>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white border border-border rounded-sm p-5" data-testid={`ao-${o.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">کد: {o.id.slice(0, 8)}</div>
                <div className="text-sm mt-1">{o.user_email}</div>
              </div>
              <div className="text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString("fa-IR")}</div>
              <div className="text-gold font-semibold">{formatPrice(o.total)}</div>
              <div className="text-xs px-2 py-1 bg-gold/10 rounded-full">{o.payment_status}</div>
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              آدرس: {o.address} | تلفن: {o.phone}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {o.items.map((i, idx) => (<span key={idx} className="ml-2">{i.name} × {i.quantity}</span>))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="text-slate-500 text-sm">سفارشی وجود ندارد.</div>}
      </div>
    </div>
  );
}
