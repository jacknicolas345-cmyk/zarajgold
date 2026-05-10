import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setUsers(r.data)); }, []);

  return (
    <div data-testid="admin-users">
      <div className="overline mb-1">کاربران</div>
      <div className="text-slate-600 text-sm mb-5">{users.length} کاربر</div>

      <div className="bg-white border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5EDD9]/40 text-right">
            <tr>
              <th className="p-3 font-medium">نام</th>
              <th className="p-3 font-medium">ایمیل</th>
              <th className="p-3 font-medium">نقش</th>
              <th className="p-3 font-medium">تاریخ ثبت‌نام</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">{u.name}</td>
                <td className="p-3 text-slate-500">{u.email}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin" ? "bg-gold text-white" : "bg-slate-100"}`}>
                    {u.role === "admin" ? "مدیر" : "کاربر"}
                  </span>
                </td>
                <td className="p-3 text-xs text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString("fa-IR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
