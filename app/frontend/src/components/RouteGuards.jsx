import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-16 text-center text-slate-500">در حال بارگذاری...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-16 text-center text-slate-500">در حال بارگذاری...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
