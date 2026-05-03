"import axios from \"axios\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return \"خطایی رخ داد. لطفاً دوباره تلاش کنید.\";
  if (typeof detail === \"string\") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === \"string\" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(\" \");
  if (detail && typeof detail.msg === \"string\") return detail.msg;
  return String(detail);
}

export function formatPrice(n) {
  const v = Number(n || 0);
  return `$${v.toLocaleString(\"en-US\", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const CATEGORY_FA = {
  ring: \"انگشتر\",
  necklace: \"گردنبند\",
  bracelet: \"دستبند\",
  earring: \"گوشواره\",
  other: \"سایر\",
};

export const MATERIAL_FA = {
  gold: \"طلا\",
  silver: \"نقره\",
};
"
