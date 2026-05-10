import React from "react";
import { useAuth } from "../lib/AuthContext";
import { Link } from "react-router-dom";
import { User, Package, ShieldCheck, LogOut } from "lucide-react";

export default function Account() {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 fade-in" data-testid="account-page">
      <div className="overline mb-3">حساب من</div>
      <h1 className="text-3xl font-light mb-10">پروفایل کاربری</h1>

      <div className="bg-white border border-border rounded-sm p-8 flex items-center gap-6">
        <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center">
          <User className="w-7 h-7" />
        </div>
        <div>
          <div className="text-lg font-medium">{user.name}</div>
          <div className="text-sm text-slate-500">{user.email}</div>
          <div className="text-xs text-gold mt-1">
            {user.role === "admin" ? "مدیر" : "کاربر"}
          </div>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Link to="/orders" className="bg-white border border-border rounded-sm p-5 flex items-center gap-4 hover:border-gold transition">
          <Package className="w-6 h-6 text-gold" />
          <div>
            <div className="font-medium">سفارش‌های من</div>
            <div className="text-xs text-slate-500">پیگیری و تاریخچه سفارش‌ها</div>
          </div>
        </Link>
        {user.role === "admin" && (
          <Link to="/admin" className="bg-white border border-border rounded-sm p-5 flex items-center gap-4 hover:border-gold transition">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <div>
              <div className="font-medium">پنل ادمین</div>
              <div className="text-xs text-slate-500">مدیریت کامل فروشگاه</div>
            </div>
          </Link>
        )}
        <button onClick={logout} className="bg-white border border-border rounded-sm p-5 flex items-center gap-4 hover:border-red-400 transition text-right">
          <LogOut className="w-6 h-6 text-red-500" />
          <div>
            <div className="font-medium">خروج از حساب</div>
            <div className="text-xs text-slate-500">پایان جلسه کاری</div>
          </div>
        </button>
      </div>
    </div>
  );
}
