import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rv_cart") || "[]");
    } catch {
      return [];
    }
  });
  const [takeback, setTakeback] = useState(() => Number(localStorage.getItem("rv_tb") || 0));

  useEffect(() => localStorage.setItem("rv_cart", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("rv_tb", String(takeback)), [takeback]);

  const add = (product, size, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.product_id === product.id && x.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(5, next[i].qty + qty) };
        return next;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: (product.images || [])[0] || null,
          size,
          qty,
        },
      ];
    });
    toast.success(`Added to bag — size ${size}`);
  };

  const remove = (product_id, size) =>
    setItems((prev) => prev.filter((x) => !(x.product_id === product_id && x.size === size)));

  const setQty = (product_id, size, qty) =>
    setItems((prev) =>
      qty < 1
        ? prev.filter((x) => !(x.product_id === product_id && x.size === size))
        : prev.map((x) => (x.product_id === product_id && x.size === size ? { ...x, qty: Math.min(5, qty) } : x))
    );

  const clear = () => {
    setItems([]);
    setTakeback(0);
  };

  const count = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((a, i) => a + i.price * i.qty, 0), [items]);
  const takebackPercent = Math.min(4, takeback) * 5;
  const discount = Math.round((subtotal * takebackPercent) / 100);

  return (
    <CartCtx.Provider
      value={{ items, add, remove, setQty, clear, count, subtotal, takeback, setTakeback, takebackPercent, discount }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
