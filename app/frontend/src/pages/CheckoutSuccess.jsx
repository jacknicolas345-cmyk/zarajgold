import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../lib/CartContext";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState("checking"); // checking | paid | expired | error
  const attempts = useRef(0);
  const { clear } = useCart();

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    let cancelled = false;
    const poll = async () => {
      try {
        const { data } = await api.get(`/checkout/status/${sessionId}`);
        if (cancelled) return;
        if (data.payment_status === "paid") { setState("paid"); clear(); return; }
        if (data.status === "expired") { setState("expired"); return; }
        if (attempts.current >= 15) { setState("expired"); return; }
        attempts.current += 1;
        setTimeout(poll, 2000);
      } catch {
        if (attempts.current >= 5) { setState("error"); return; }
        attempts.current += 1;
        setTimeout(poll, 2000);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [sessionId, clear]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center fade-in" data-testid="checkout-success">
      {state === "checking" && (
        <>
          <Clock className="w-16 h-16 text-gold mx-auto" />
          <h1 className="text-2xl font-medium mt-6">در حال بررسی وضعیت پرداخت...</h1>
          <p className="text-slate-500 mt-3">لطفاً چند لحظه منتظر بمانید.</p>
        </>
      )}
      {state === "paid" && (
        <>
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
          <h1 className="text-2xl font-medium mt-6">پرداخت با موفقیت انجام شد</h1>
          <p className="text-slate-500 mt-3">سفارش شما ثبت شد. جزئیات از طریق ایمیل ارسال خواهد شد.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/orders" className="btn-gold" data-testid="view-orders-btn">مشاهده سفارش‌ها</Link>
            <Link to="/shop" className="btn-outline-gold">ادامه خرید</Link>
          </div>
        </>
      )}
      {state === "expired" && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-medium mt-6">پرداخت ناموفق یا منقضی</h1>
          <Link to="/cart" className="btn-gold inline-block mt-8">بازگشت به سبد خرید</Link>
        </>
      )}
      {state === "error" && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-medium mt-6">خطا در بررسی وضعیت</h1>
          <Link to="/orders" className="btn-gold inline-block mt-8">مشاهده سفارش‌ها</Link>
        </>
      )}
    </div>
  );
}
