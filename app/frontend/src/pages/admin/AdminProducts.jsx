"import React, { useEffect, useState } from \"react\";
import { api, formatPrice, CATEGORY_FA, MATERIAL_FA, formatApiErrorDetail } from \"../../lib/api\";
import { Input } from \"../../components/ui/input\";
import { Textarea } from \"../../components/ui/textarea\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"../../components/ui/select\";
import { Switch } from \"../../components/ui/switch\";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from \"../../components/ui/dialog\";
import { Plus, Edit2, Trash2 } from \"lucide-react\";
import { toast } from \"sonner\";

const EMPTY = {
  name: \"\", description: \"\", price: 0, category: \"ring\", material: \"gold\",
  karat: \"18K\", weight: 0, has_gemstone: false, image: \"\", stock: 10, featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get(\"/products\").then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditingId(null); setOpen(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: p.price, category: p.category,
      material: p.material, karat: p.karat || \"\", weight: p.weight || 0,
      has_gemstone: !!p.has_gemstone, image: p.image, stock: p.stock, featured: !!p.featured,
    });
    setEditingId(p.id); setOpen(true);
  };

  const save = async () => {
    const payload = { ...form, price: Number(form.price), weight: Number(form.weight) || null, stock: Number(form.stock) };
    try {
      if (editingId) await api.put(`/admin/products/${editingId}`, payload);
      else await api.post(\"/admin/products\", payload);
      toast.success(\"ذخیره شد\");
      setOpen(false); load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const del = async (id) => {
    if (!window.confirm(\"حذف شود؟\")) return;
    await api.delete(`/admin/products/${id}`);
    toast.success(\"حذف شد\"); load();
  };

  return (
    <div data-testid=\"admin-products\">
      <div className=\"flex items-center justify-between mb-6\">
        <div>
          <div className=\"overline\">محصولات</div>
          <div className=\"text-slate-600 text-sm mt-1\">{products.length} محصول</div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button onClick={openNew} className=\"btn-gold inline-flex items-center gap-2\" data-testid=\"new-product-btn\">
              <Plus className=\"w-4 h-4\" /> محصول جدید
            </button>
          </DialogTrigger>
          <DialogContent className=\"max-w-2xl max-h-[90vh] overflow-y-auto\">
            <DialogHeader><DialogTitle>{editingId ? \"ویرایش محصول\" : \"محصول جدید\"}</DialogTitle></DialogHeader>
            <div className=\"grid grid-cols-2 gap-4 mt-4\">
              <div className=\"col-span-2\">
                <label className=\"text-sm\">نام</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid=\"pf-name\" />
              </div>
              <div className=\"col-span-2\">
                <label className=\"text-sm\">توضیحات</label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className=\"text-sm\">قیمت ($)</label>
                <Input type=\"number\" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid=\"pf-price\" />
              </div>
              <div>
                <label className=\"text-sm\">موجودی</label>
                <Input type=\"number\" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <label className=\"text-sm\">دسته</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_FA).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className=\"text-sm\">جنس</label>
                <Select value={form.material} onValueChange={(v) => setForm({ ...form, material: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MATERIAL_FA).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className=\"text-sm\">عیار</label>
                <Input value={form.karat} onChange={(e) => setForm({ ...form, karat: e.target.value })} />
              </div>
              <div>
                <label className=\"text-sm\">وزن (گرم)</label>
                <Input type=\"number\" step=\"0.1\" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div className=\"col-span-2\">
                <label className=\"text-sm\">آدرس تصویر</label>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder=\"https://...\" data-testid=\"pf-image\" />
              </div>
              <label className=\"flex items-center gap-3\">
                <Switch checked={form.has_gemstone} onCheckedChange={(v) => setForm({ ...form, has_gemstone: v })} /> دارای نگین
              </label>
              <label className=\"flex items-center gap-3\">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> منتخب
              </label>
            </div>
            <DialogFooter className=\"mt-6\">
              <button onClick={save} className=\"btn-gold\" data-testid=\"pf-save\">ذخیره</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className=\"bg-white border border-border rounded-sm overflow-hidden\">
        <table className=\"w-full text-sm\">
          <thead className=\"bg-[#F5EDD9]/40 text-right\">
            <tr>
              <th className=\"p-3 font-medium\">تصویر</th>
              <th className=\"p-3 font-medium\">نام</th>
              <th className=\"p-3 font-medium\">دسته</th>
              <th className=\"p-3 font-medium\">قیمت</th>
              <th className=\"p-3 font-medium\">موجودی</th>
              <th className=\"p-3 font-medium\">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className=\"border-t border-border\">
                <td className=\"p-3\"><img src={p.image} alt=\"\" className=\"w-12 h-12 object-cover rounded-sm\" /></td>
                <td className=\"p-3\">{p.name}</td>
                <td className=\"p-3 text-slate-500\">{CATEGORY_FA[p.category]}</td>
                <td className=\"p-3 text-gold\">{formatPrice(p.price)}</td>
                <td className=\"p-3\">{p.stock}</td>
                <td className=\"p-3\">
                  <div className=\"flex gap-2\">
                    <button onClick={() => openEdit(p)} className=\"p-2 hover:bg-gold/10 rounded-sm\" data-testid={`edit-${p.id}`}><Edit2 className=\"w-4 h-4\" /></button>
                    <button onClick={() => del(p.id)} className=\"p-2 hover:bg-red-50 rounded-sm text-red-500\" data-testid={`del-${p.id}`}><Trash2 className=\"w-4 h-4\" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"
