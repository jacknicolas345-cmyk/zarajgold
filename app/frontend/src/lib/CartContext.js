"import React, { createContext, useContext, useEffect, useState } from \"react\";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = \"zaraj_cart_v1\";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
      }];
    });
  };

  const updateQty = (product_id, qty) => {
    setItems((prev) => prev.map((i) => i.product_id === product_id ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const remove = (product_id) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * Number(i.price), 0);

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}
"
