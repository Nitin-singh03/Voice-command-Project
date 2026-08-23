import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useVoice } from "../context/VoiceContext";
import RecommendationPanel from "../components/RecommendationPanel";

export default function Cart() {
  const [searchParams] = useSearchParams();
  const {
    cart,
    removeFromCart,
    updateQty,
    clearCart,
    cartCount,
    cartSubtotal,
    cartTotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingFee,
    estimatedTax,
    showToast,
  } = useCart();

  const { openVoiceModal, speakText } = useVoice();

  const [couponInput, setCouponInput] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  const [formData, setFormData] = useState({
    name: "Alex Sterling",
    email: "alex.sterling@example.com",
    address: "742 Evergreen Sanctuary Way, Suite 400",
    city: "San Francisco",
    zip: "94107",
    deliverySlot: "Today: 5:00 PM – 7:00 PM (Eco-Courier)",
    paymentMethod: "apple-pay",
    cardNumber: "•••• •••• •••• 4242",
  });

  useEffect(() => {
    if (searchParams.get("checkout") === "true" && cart.length > 0) {
      setIsCheckingOut(true);
    }
  }, [searchParams, cart.length]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
    setCouponInput("");
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const orderNumber = "LUM-" + Math.floor(100000 + Math.random() * 900000);
    const confirmedOrder = {
      orderId: orderNumber,
      items: [...cart],
      total: cartTotal,
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      tax: estimatedTax,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      deliverySlot: formData.deliverySlot,
      address: `${formData.address}, ${formData.city}, ${formData.zip}`,
    };
    setOrderConfirmed(confirmedOrder);
    setIsCheckingOut(false);
    clearCart();
    speakText(`Thank you for your order! Your Lumina order number is ${orderNumber}.`);
    showToast(`Order #${orderNumber} placed successfully!`, "success");
  };

  if (orderConfirmed) {
    return (
      <main className="pt-6 md:pt-8 pb-xl px-margin-mobile md:px-gutter max-w-3xl mx-auto">
        <div className="glass-modal rounded-3xl p-8 md:p-12 text-center ambient-shadow border border-white/90 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/5">
            <span className="material-symbols-outlined text-4xl">verified</span>
          </div>

          <span className="font-label text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
            Order Confirmed
          </span>

          <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mt-3 mb-2">
            Thank you for shopping with Lumina!
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
            We are preparing your fresh organic produce and artisanal luxury items for dispatch.
          </p>

          {/* Receipt Card */}
          <div className="glass-panel rounded-2xl p-6 text-left mb-8 border border-white/60">
            <div className="flex justify-between items-center border-b border-white/40 pb-4 mb-4">
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-semibold">Order Reference</p>
                <p className="font-headline font-bold text-lg text-primary">{orderConfirmed.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant uppercase font-semibold">Estimated Arrival</p>
                <p className="text-sm font-medium text-on-surface">{orderConfirmed.deliverySlot}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {orderConfirmed.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-on-surface">
                    <strong className="text-primary">{item.qty}x</strong> {item.name}
                  </span>
                  <span className="font-medium text-on-surface">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/40 pt-3 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${orderConfirmed.subtotal.toFixed(2)}</span>
              </div>
              {orderConfirmed.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-${orderConfirmed.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Eco Shipping</span>
                <span>{orderConfirmed.shipping === 0 ? "FREE" : `$${orderConfirmed.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>${orderConfirmed.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-on-surface pt-2 border-t border-white/40">
                <span>Total Paid</span>
                <span className="text-primary">${orderConfirmed.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-primary text-on-primary font-label text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-opacity-90 transition-all shadow-lg text-center"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="glass-button text-on-surface font-label text-sm font-semibold px-6 py-3.5 rounded-full flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span> Print Receipt
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="pt-6 md:pt-8 pb-xl px-margin-mobile md:px-gutter max-w-container-max mx-auto text-center">
        <div className="glass-panel max-w-lg mx-auto p-8 md:p-12 rounded-3xl ambient-shadow border border-white/70">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">shopping_basket</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            Explore our curated seasonal harvests, wellness botanicals, and artisanal bakery essentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search?q=all"
              className="bg-primary text-on-primary font-label text-sm font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-all shadow-md"
            >
              Browse Catalog
            </Link>
            <button
              onClick={openVoiceModal}
              className="glass-btn-secondary text-primary font-label text-sm font-semibold px-6 py-3 rounded-full flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">mic</span>
              Add Items by Voice
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-6 md:pt-8 pb-xl px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-on-surface font-medium">Shopping Bag</span>
          </nav>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3">
            Your Shopping Bag
            <span className="text-base font-normal px-3 py-1 rounded-full bg-primary/10 text-primary">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openVoiceModal}
            className="glass-button text-primary font-label text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">mic</span>
            Voice Assistant
          </button>
          <button
            onClick={clearCart}
            className="text-xs text-on-surface-variant hover:text-red-600 transition-colors flex items-center gap-1 px-3 py-2"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            Clear Cart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-white/70 border border-white/70"
            >
              <div className="flex items-center gap-4 flex-grow">
                <Link to={`/product/${item.id}`} className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden glass-card flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </Link>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">{item.category}</span>
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-headline font-bold text-base md:text-lg text-on-surface hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-on-surface-variant">
                    ${item.price.toFixed(2)} / {item.unit}
                  </p>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-end sm:self-center">
                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/60">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-5 text-center text-on-surface">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <p className="font-headline font-bold text-lg text-primary">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50/50 rounded-full transition-colors"
                  title="Remove item"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>
          ))}

          {/* Voice Prompt Box */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Voice Shortcuts</p>
                <p className="text-xs text-on-surface-variant">Try saying "Apply coupon LUMINA20" or "Add Sourdough Boule"</p>
              </div>
            </div>
            <button
              onClick={openVoiceModal}
              className="glass-button text-xs font-semibold text-primary px-3 py-1.5 rounded-full"
            >
              Try Voice
            </button>
          </div>

          {/* Real AI Recommendation Panel */}
          <RecommendationPanel />
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="lg:col-span-4 sticky top-28">
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6 border border-white/80 ambient-shadow">
            <h2 className="font-headline text-xl font-bold text-on-surface">Order Summary</h2>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Promo code (e.g. LUMINA20)"
                className="glass-input text-xs py-2.5 px-4 flex-grow uppercase"
              />
              <button
                type="submit"
                className="bg-primary text-on-primary font-label text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-opacity-90 transition-all"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 px-3.5 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span className="font-medium">{appliedCoupon.label}</span>
                </div>
                <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
                  ×
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-sm text-on-surface-variant border-t border-white/40 pt-4">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-medium text-on-surface">${cartSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Special Savings</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Eco Delivery
                  {cartSubtotal > 75 && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">FREE OVER $75</span>}
                </span>
                <span className="font-medium text-on-surface">
                  {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8.25%)</span>
                <span className="font-medium text-on-surface">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="border-t border-white/60 pt-4 flex justify-between items-baseline text-on-surface">
                <span className="font-headline font-bold text-lg">Total Amount</span>
                <span className="font-headline font-extrabold text-2xl text-primary">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full bg-primary text-on-primary font-label text-sm font-semibold py-4 rounded-full shadow-[inset_0_0_0_2px_rgba(255,255,255,0.2)] hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-lg">lock</span>
              Proceed to Secure Checkout
            </button>

            <div className="text-center">
              <p className="text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm text-emerald-600">eco</span>
                Carbon-neutral 100% biodegradable packaging
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Flow Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-modal max-w-xl w-full rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-white/80 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-white/40 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Lumina Express Checkout</span>
                <h3 className="font-headline text-2xl font-bold text-on-surface">Complete Your Order</h3>
              </div>
              <button
                onClick={() => setIsCheckingOut(false)}
                className="p-2 rounded-full hover:bg-white/60 text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className={`flex items-center gap-2 ${checkoutStep >= 1 ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${checkoutStep >= 1 ? "bg-primary text-white" : "bg-white/60"}`}>1</span>
                <span className="text-xs hidden sm:inline">Delivery</span>
              </div>
              <div className="h-0.5 w-12 bg-white/60" />
              <div className={`flex items-center gap-2 ${checkoutStep >= 2 ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${checkoutStep >= 2 ? "bg-primary text-white" : "bg-white/60"}`}>2</span>
                <span className="text-xs hidden sm:inline">Schedule</span>
              </div>
              <div className="h-0.5 w-12 bg-white/60" />
              <div className={`flex items-center gap-2 ${checkoutStep >= 3 ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${checkoutStep >= 3 ? "bg-primary text-white" : "bg-white/60"}`}>3</span>
                <span className="text-xs hidden sm:inline">Payment</span>
              </div>
            </div>

            <form onSubmit={checkoutStep === 3 ? handlePlaceOrder : (e) => { e.preventDefault(); setCheckoutStep(checkoutStep + 1); }}>
              {/* Step 1: Shipping Address */}
              {checkoutStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input mt-1 text-sm py-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="glass-input mt-1 text-sm py-2.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="glass-input mt-1 text-sm py-2.5"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase">ZIP Code</label>
                      <input
                        type="text"
                        required
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="glass-input mt-1 text-sm py-2.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Time Window */}
              {checkoutStep === 2 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Select Delivery Time Slot</p>
                  {[
                    "Today: 5:00 PM – 7:00 PM (Eco-Courier)",
                    "Today: 8:00 PM – 10:00 PM (Night Whisper)",
                    "Tomorrow Morning: 8:00 AM – 10:00 AM (Sunrise Fresh)",
                    "Tomorrow Afternoon: 1:00 PM – 3:00 PM",
                  ].map((slot) => (
                    <label
                      key={slot}
                      className={`glass-panel p-4 rounded-xl flex items-center gap-3 cursor-pointer border transition-all ${
                        formData.deliverySlot === slot ? "border-primary bg-primary/10" : "border-white/60 hover:bg-white/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliverySlot"
                        checked={formData.deliverySlot === slot}
                        onChange={() => setFormData({ ...formData, deliverySlot: slot })}
                        className="text-primary accent-primary"
                      />
                      <span className="text-sm font-medium text-on-surface">{slot}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Step 3: Payment Method */}
              {checkoutStep === 3 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Choose Payment Method</p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { id: "apple-pay", label: "Apple Pay", icon: "wallet" },
                      { id: "card", label: "Credit Card", icon: "credit_card" },
                      { id: "cash", label: "Cash on Arrival", icon: "payments" },
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setFormData({ ...formData, paymentMethod: p.id })}
                        className={`glass-panel p-3 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                          formData.paymentMethod === p.id ? "border-primary bg-primary/15" : "border-white/60"
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl text-primary">{p.icon}</span>
                        <span className="text-xs font-semibold text-on-surface">{p.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-white/60 space-y-2 text-xs text-on-surface-variant">
                    <div className="flex justify-between text-sm font-bold text-on-surface">
                      <span>Total Due</span>
                      <span className="text-primary">${cartTotal.toFixed(2)}</span>
                    </div>
                    <p>Delivering to: <strong className="text-on-surface">{formData.address}, {formData.city}</strong></p>
                    <p>Time window: <strong className="text-on-surface">{formData.deliverySlot}</strong></p>
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/40">
                {checkoutStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(checkoutStep - 1)}
                    className="glass-button text-xs font-semibold px-5 py-2.5 rounded-full"
                  >
                    Back
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  className="bg-primary text-on-primary font-label text-sm font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg flex items-center gap-2"
                >
                  {checkoutStep === 3 ? `Place Order ($${cartTotal.toFixed(2)})` : "Continue"}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
