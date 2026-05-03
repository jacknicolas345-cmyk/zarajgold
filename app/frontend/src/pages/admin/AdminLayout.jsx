"import React, { useEffect, useState } from \"react\";
import { Link, Outlet, useLocation } from \"react-router-dom\";
import { LayoutDashboard, Package, ShoppingCart, Users } from \"lucide-react\";

const TABS = [
  { to: \"/admin\", label: \"داشبورد\", icon: LayoutDashboard, end: true },
  { to: \"/admin/products\", label: \"محصولات\", icon: Package },
  { to: \"/admin/orders\", label: \"سفارش‌ها\", icon: ShoppingCart },
  { to: \"/admin/users\", label: \"کاربران\", icon: Users },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className=\"max-w-7xl mx-auto px-4 sm:px-8 py-10 fade-in\" data-testid=\"admin-layout\">
      <div className=\"overline mb-3\">پنل مدیریت</div>
      <h1 className=\"text-3xl font-light mb-8\">مدیریت فروشگاه</h1>

      <div className=\"grid lg:grid-cols-[240px_1fr] gap-8\">
        <aside className=\"bg-white border border-border rounded-sm p-4 h-fit space-y-1\">
          {TABS.map((t) => {
            const active = t.end ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition ${
                  active ? \"bg-gold text-white\" : \"text-slate-700 hover:bg-gold/10\"
                }`}
                data-testid={`admin-tab-${t.label}`}
              >
                <Icon className=\"w-4 h-4\" /> {t.label}
              </Link>
            );
          })}
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
"
