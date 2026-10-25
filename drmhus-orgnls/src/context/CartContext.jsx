import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

const DELIVERY_FEE = 2500;
const FREE_SHIPPING_THRESHOLD = 50000;

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("drmhus_cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Failed to load cart from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("drmhus_cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("Failed to save cart to localStorage:", error);
    }
  }, [cart, isLoaded]);

  const addItem = useCallback((product, selectedOptions = {}) => {
    setCart((current) => {
      const { size, color } = selectedOptions;
      const optionKey = `${size || "default"}|${color || "default"}`;
      const existing = current.find(
        (item) => item.id === product.id && item.optionKey === optionKey
      );

      if (existing) {
        if (existing.quantity < (existing.stock || 999)) {
          return current.map((item) =>
            item.id === product.id && item.optionKey === optionKey
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return current;
      }

      return [
        ...current,
        {
          ...product,
          optionKey,
          size: size || product.defaultSize,
          color: color || product.defaultColor,
          quantity: 1,
          stock: product.stock || 999,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId, optionKey) => {
    setCart((current) =>
      current.filter(
        (item) => !(item.id === productId && item.optionKey === optionKey)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId, optionKey, quantity) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id === productId && item.optionKey === optionKey) {
          const qty = Math.max(1, Math.min(quantity, item.stock || 999));
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const value = {
    cart,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}