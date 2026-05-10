import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("رمز باید حداقل ۶ کاراکتر باشد"); return; }
    setLoading(true);
    const r = await register(email, password, name);
    setLoading(false);
    if (r.ok) { toast.success("حساب شما ساخته شد"); nav("/"); }
    else toast.error(r.error);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 fade-in" data-testid="register-page">
      <div className="overline mb-3 text-center">عضویت</div>
      <h1 className="text-3xl font-light text-center mb-10">ایجاد حساب جدید</h1>
      <form onSubmit={submit} className="space-y-5 bg-white border border-border rounded-sm p-8">
        <div>
          <label className="text-sm font-medium block mb-2">نام و نام خانوادگی</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required data-testid="reg-name" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">ایمیل</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="reg-email" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">رمز عبور</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="reg-password" />
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60" data-testid="reg-submit">
          {loading ? "در حال ثبت..." : "ثبت‌نام"}
        </button>
        <div className="text-sm text-center text-slate-500">
          حساب دارید؟{" "}
          <Link to="/login" className="text-gold link-hover">وارد شوید</Link>
        </div>
      </form>
    </div>
  );
}
