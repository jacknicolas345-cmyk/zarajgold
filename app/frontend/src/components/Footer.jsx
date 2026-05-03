"import React from \"react\";
import { Link } from \"react-router-dom\";
import { Instagram, Phone, Mail, MapPin } from \"lucide-react\";

export default function Footer() {
  return (
    <footer className=\"mt-24 border-t border-border bg-white\" data-testid=\"footer\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10\">
        <div>
          <div className=\"flex items-center gap-2 mb-4\">
            <div className=\"w-9 h-9 rounded-sm bg-gold flex items-center justify-center text-white font-bold\">ز</div>
            <div>
              <div className=\"text-lg font-semibold\">زَرَج گُلد</div>
              <div className=\"text-[10px] text-gold tracking-widest\">ZARAJ · GOLD</div>
            </div>
          </div>
          <p className=\"text-sm text-slate-600 leading-relaxed\">
            فروشگاه آنلاین طلا و جواهرات اصیل. طراحی‌های ظریف و مینیمال با ضمانت اصالت.
          </p>
        </div>
        <div>
          <div className=\"overline mb-4\">دسترسی سریع</div>
          <ul className=\"space-y-2 text-sm\">
            <li><Link to=\"/shop\" className=\"link-hover\">فروشگاه</Link></li>
            <li><Link to=\"/about\" className=\"link-hover\">درباره ما</Link></li>
            <li><Link to=\"/orders\" className=\"link-hover\">پیگیری سفارش</Link></li>
            <li><Link to=\"/login\" className=\"link-hover\">ورود / ثبت‌نام</Link></li>
          </ul>
        </div>
        <div>
          <div className=\"overline mb-4\">دسته‌بندی</div>
          <ul className=\"space-y-2 text-sm\">
            <li><Link to=\"/shop?category=ring\" className=\"link-hover\">انگشتر</Link></li>
            <li><Link to=\"/shop?category=necklace\" className=\"link-hover\">گردنبند</Link></li>
            <li><Link to=\"/shop?category=earring\" className=\"link-hover\">گوشواره</Link></li>
            <li><Link to=\"/shop?category=bracelet\" className=\"link-hover\">دستبند</Link></li>
          </ul>
        </div>
        <div>
          <div className=\"overline mb-4\">تماس با ما</div>
          <ul className=\"space-y-3 text-sm text-slate-600\">
            <li className=\"flex items-center gap-2\"><Phone className=\"w-4 h-4 text-gold\" /> ۰۲۱-۸۸۹۰۰۰۰۰</li>
            <li className=\"flex items-center gap-2\"><Mail className=\"w-4 h-4 text-gold\" /> info@zarajgold.ir</li>
            <li className=\"flex items-center gap-2\"><MapPin className=\"w-4 h-4 text-gold\" /> تهران، خیابان فردوسی</li>
            <li className=\"flex items-center gap-2\"><Instagram className=\"w-4 h-4 text-gold\" /> @zarajgold</li>
          </ul>
        </div>
      </div>
      <div className=\"border-t border-border\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-8 py-6 text-xs text-slate-500 flex flex-wrap justify-between gap-2\">
          <div>© {new Date().getFullYear()} زَرَج گُلد — تمامی حقوق محفوظ است.</div>
          <div>طراحی لوکس · ارسال امن · ضمانت اصالت</div>
        </div>
      </div>
    </footer>
  );
}
"
