import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

const COUPONS = {
  LUMINA20: { code: "LUMINA20", discountPct: 0.20, label: "20% Off Lumina Special" },
  ORGANIC10: { code: "ORGANIC10", discountFixed: 10, label: "$10 Off Organic Essentials" },
  FREESHIP: { code: "FREESHIP", freeShipping: true, label: "Free Express Shipping" },
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("lumina_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("lumina_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("lumina_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("lumina_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlist]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
    showToast(`Added ${qty > 1 ? `${qty}x ` : ""}"${product.name}" to cart`);
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) showToast(`Removed "${item.name}" from cart`, "info");
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setCart([]);
    showToast("Cart cleared", "info");
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    setWishlist((prev) => {
      const exists = prev.some((i) => i.id === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist`, "info");
        return prev.filter((i) => i.id !== product.id);
      } else {
        showToast(`Added "${product.name}" to wishlist`, "success");
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (id) => wishlist.some((i) => i.id === id);

  const applyCoupon = (codeStr) => {
    if (!codeStr) return { success: false, message: "Please enter a coupon code." };
    const clean = codeStr.trim().toUpperCase();
    const found = COUPONS[clean];
    if (found) {
      setAppliedCoupon(found);
      showToast(`Promo code "${found.code}" applied!`, "success");
      return { success: true, message: `Applied ${found.label}` };
    } else {
      showToast(`Invalid coupon "${clean}". Try "LUMINA20"`, "error");
      return { success: false, message: "Invalid promo code. Try 'LUMINA20' or 'ORGANIC10'" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Promo code removed", "info");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const rawSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartSubtotal = Number(rawSubtotal.toFixed(2));

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPct) {
      discountAmount = cartSubtotal * appliedCoupon.discountPct;
    } else if (appliedCoupon.discountFixed) {
      discountAmount = Math.min(appliedCoupon.discountFixed, cartSubtotal);
    }
  }
  discountAmount = Number(discountAmount.toFixed(2));

  const standardShipping = cartSubtotal > 75 || appliedCoupon?.freeShipping || cartSubtotal === 0 ? 0 : 7.99;
  const estimatedTax = Number(((cartSubtotal - discountAmount) * 0.0825).toFixed(2));
  const finalTotal = Math.max(0, Number((cartSubtotal - discountAmount + standardShipping + estimatedTax).toFixed(2)));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTotal: finalTotal,
        discountAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shippingFee: standardShipping,
        estimatedTax,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
