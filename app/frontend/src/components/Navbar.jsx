import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";
import { ShoppingBag, User, Menu, X, LogOut, ShieldCheck, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

const NAV = [
  { to: "/", label: "خانه" },
  { to: "/shop", label: "فروشگاه" },
  { to: "/shop?category=ring", label: "انگشتر" },
  { to: "/shop?category=necklace", label: "گردنبند" },
  { to: "/shop?category=earring", label: "گوشواره" },
  { to: "/shop?category=bracelet", label: "دستبند" },
  { to: "/about", label: "درباره ما" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  return (
    <header className="nav-blur sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
          <div className="w-9 h-9 rounded-sm bg-gold flex items-center justify-center text-white font-bold">ز</div>
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight">زَرَج گُلد</div>
            <div className="text-[10px] text-gold tracking-widest">ZARAJ · GOLD</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV.map((n) => (
            <NavLink
              key={n.to + n.label}
              to={n.to}
              className={({ isActive }) =>
                `link-hover transition-colors ${isActive ? "text-gold" : "text-slate-700 hover:text-gold"}`
              }
              data-testid={`nav-link-${n.label}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-gold/10 transition" data-testid="nav-cart">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -left-1 bg-gold text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gold/10 transition flex items-center gap-2" data-testid="nav-user-menu">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => nav("/account")} data-testid="menu-account">
                  <User className="w-4 h-4 ml-2" /> حساب من
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/orders")} data-testid="menu-orders">
                  <Package className="w-4 h-4 ml-2" /> سفارش‌ها
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => nav("/admin")} data-testid="menu-admin">
                    <ShieldCheck className="w-4 h-4 ml-2" /> پنل ادمین
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await logout(); nav("/"); }} data-testid="menu-logout">
                  <LogOut className="w-4 h-4 ml-2" /> خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="btn-outline-gold hidden sm:inline-block" data-testid="nav-login">ورود</Link>
          )}

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} data-testid="mobile-menu-btn">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white" data-testid="mobile-menu">
          <div className="px-4 py-3 flex flex-col gap-3">
            {NAV.map((n) => (
              <Link key={n.to + n.label} to={n.to} onClick={() => setOpen(false)} className="text-sm py-2">
                {n.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login" className="btn-outline-gold text-center" onClick={() => setOpen(false)}>ورود</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
