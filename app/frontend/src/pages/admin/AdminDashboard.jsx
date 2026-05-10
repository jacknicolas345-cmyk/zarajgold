import React, { useEffect, useState } from "react";
import { api, formatPrice } from "../../lib/api";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);

  const cards = stats ? [
    { label: "درآمد کل", value: formatPrice(stats.revenue), icon: DollarSign },
    { label: "سفارش‌ها", value: stats.orders, icon: ShoppingCart },
    { label: "محصولات", value: stats.products, icon: Package },
    { label: "کاربران", value: stats.users, icon: Users },
  ] : [];

  return (
    <div data-testid="admin-dashboard">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-border rounded-sm p-6">
            <div className="flex items-center justify-between">
              <div className="overline text-[10px]">{c.label}</div>
              <c.icon className="w-5 h-5 text-gold" />
            </div>
            <div className="text-3xl font-light mt-3 text-slate-900">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white border border-border rounded-sm p-6">
        <div className="overline mb-2">خوش آمدید</div>
        <div className="text-slate-600 leading-loose">
          از این پنل می‌توانید محصولات، سفارش‌ها و کاربران را مدیریت کنید.
        </div>
      </div>
    </div>
  );
}
