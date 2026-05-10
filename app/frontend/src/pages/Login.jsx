import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (r.ok) { toast.success("خوش آمدید"); nav(params.get("next") || "/"); }
    else toast.error(r.error);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 fade-in" data-testid="login-page">
      <div className="overline mb-3 text-center">حساب کاربری</div>
      <h1 className="text-3xl font-light text-center mb-10">ورود به حساب</h1>
      <form onSubmit={submit} className="space-y-5 bg-white border border-border rounded-sm p-8">
        <div>
          <label className="text-sm font-medium block mb-2">ایمیل</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">رمز عبور</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password" />
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60" data-testid="login-submit">
          {loading ? "در حال ورود..." : "ورود"}
        </button>
        <div className="text-sm text-center text-slate-500">
          حساب ندارید؟{" "}
          <Link to="/register" className="text-gold link-hover">ثبت‌نام کنید</Link>
        </div>
      </form>
    </div>
  );
}
