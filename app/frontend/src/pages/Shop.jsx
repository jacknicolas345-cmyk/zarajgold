"import React, { useEffect, useMemo, useState } from \"react\";
import { useSearchParams } from \"react-router-dom\";
import { api, CATEGORY_FA, MATERIAL_FA } from \"../lib/api\";
import ProductCard from \"../components/ProductCard\";
import { Checkbox } from \"../components/ui/checkbox\";
import { Input } from \"../components/ui/input\";
import { Slider } from \"../components/ui/slider\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"../components/ui/select\";

const CATEGORIES = [\"ring\", \"necklace\", \"bracelet\", \"earring\"];
const MATERIALS = [\"gold\", \"silver\"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCat = params.get(\"category\") || \"\";
  const selectedMat = params.get(\"material\") || \"\";
  const q = params.get(\"q\") || \"\";
  const withGem = params.get(\"gem\") === \"1\";
  const maxPrice = Number(params.get(\"max\") || 1000);
  const sort = params.get(\"sort\") || \"newest\";

  useEffect(() => {
    setLoading(true);
    const query = {};
    if (selectedCat) query.category = selectedCat;
    if (selectedMat) query.material = selectedMat;
    if (withGem) query.has_gemstone = true;
    if (q) query.q = q;
    if (maxPrice) query.max_price = maxPrice;
    api.get(\"/products\", { params: query })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [selectedCat, selectedMat, withGem, q, maxPrice]);

  const sorted = useMemo(() => {
    const arr = [...products];
    if (sort === \"price-asc\") arr.sort((a, b) => a.price - b.price);
    if (sort === \"price-desc\") arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [products, sort]);

  const update = (key, val) => {
    const next = new URLSearchParams(params);
    if (val === \"\" || val === false || val === null || val === undefined) next.delete(key);
    else next.set(key, String(val));
    setParams(next);
  };

  return (
    <div className=\"max-w-7xl mx-auto px-4 sm:px-8 py-12 fade-in\" data-testid=\"shop-page\">
      <div className=\"mb-10\">
        <div className=\"overline mb-3\">فروشگاه</div>
        <h1 className=\"text-3xl sm:text-4xl font-light\">همه محصولات</h1>
      </div>

      <div className=\"grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10\">
        {/* Filters */}
        <aside className=\"space-y-8 lg:sticky lg:top-28 lg:self-start\">
          <div>
            <div className=\"overline mb-3\">جستجو</div>
            <Input
              placeholder=\"نام محصول...\"
              defaultValue={q}
              onBlur={(e) => update(\"q\", e.target.value)}
              onKeyDown={(e) => e.key === \"Enter\" && update(\"q\", e.target.value)}
              data-testid=\"search-input\"
            />
          </div>

          <div>
            <div className=\"overline mb-3\">دسته‌بندی</div>
            <div className=\"space-y-2\">
              <button onClick={() => update(\"category\", \"\")} className={`block text-sm ${!selectedCat ? \"text-gold\" : \"text-slate-700\"}`}>همه</button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => update(\"category\", c)}
                  className={`block text-sm transition ${selectedCat === c ? \"text-gold\" : \"text-slate-700 hover:text-gold\"}`}
                  data-testid={`filter-cat-${c}`}
                >
                  {CATEGORY_FA[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className=\"overline mb-3\">جنس</div>
            <div className=\"space-y-2\">
              <button onClick={() => update(\"material\", \"\")} className={`block text-sm ${!selectedMat ? \"text-gold\" : \"text-slate-700\"}`}>همه</button>
              {MATERIALS.map((m) => (
                <button
                  key={m}
                  onClick={() => update(\"material\", m)}
                  className={`block text-sm transition ${selectedMat === m ? \"text-gold\" : \"text-slate-700 hover:text-gold\"}`}
                  data-testid={`filter-mat-${m}`}
                >
                  {MATERIAL_FA[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className=\"overline mb-3\">قیمت حداکثر</div>
            <Slider
              value={[maxPrice]}
              min={50}
              max={1000}
              step={10}
              onValueChange={(v) => update(\"max\", v[0])}
              data-testid=\"price-slider\"
            />
            <div className=\"text-sm text-slate-600 mt-2\">${maxPrice}</div>
          </div>

          <label className=\"flex items-center gap-2 text-sm cursor-pointer\">
            <Checkbox checked={withGem} onCheckedChange={(v) => update(\"gem\", v ? \"1\" : \"\")} data-testid=\"gem-checkbox\" />
            فقط دارای نگین
          </label>
        </aside>

        {/* Results */}
        <div>
          <div className=\"flex items-center justify-between mb-6\">
            <div className=\"text-sm text-slate-500\">{sorted.length} محصول</div>
            <Select value={sort} onValueChange={(v) => update(\"sort\", v)}>
              <SelectTrigger className=\"w-48\" data-testid=\"sort-select\">
                <SelectValue placeholder=\"مرتب‌سازی\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"newest\">جدیدترین</SelectItem>
                <SelectItem value=\"price-asc\">ارزان‌ترین</SelectItem>
                <SelectItem value=\"price-desc\">گران‌ترین</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className=\"py-20 text-center text-slate-500\">در حال بارگذاری...</div>
          ) : sorted.length === 0 ? (
            <div className=\"py-20 text-center text-slate-500\">محصولی یافت نشد</div>
          ) : (
            <div className=\"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6\">
              {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"
