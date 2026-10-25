import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { money } from "../utils/formatters";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, itemCount, subtotal, deliveryFee, total, clearCart } = useCart();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("form");

  useEffect(() => {
    if (itemCount === 0) {
      navigate("/");
    }
  }, [itemCount, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = "Name is required.";
    if (!form.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      newErrors.customerEmail = "Enter a valid email.";
    }
    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required.";
    }
    if (!form.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Delivery address is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setStep("processing");

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.customerEmail,
          items: cart.map((item) => ({
            productId: item._id || item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          deliveryAddress: form.deliveryAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.authorizationUrl) {
        throw new Error(data.message || "Payment initialization failed.");
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setStep("error");
    }
  };

  if (step === "success") {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <ArrowLeft size={20} onClick={() => navigate("/")} className="back-link" />
            <h1>Payment Successful</h1>
          </div>
          <div className="success-card">
            <CheckCircle size={48} className="success-icon" />
            <h2>Thank you, {form.customerName.split(" ")[0]}</h2>
            <p>
              Your order has been placed successfully. We&rsquo;ve sent a
              confirmation email to {form.customerEmail}.
            </p>
            <div className="order-summary">
              <p><strong>Order total:</strong> {money(total)}</p>
              <p><strong>Items:</strong> {itemCount}</p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                clearCart();
                navigate("/");
              }}
            >
              BACK TO SHOP
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <ArrowLeft size={20} onClick={() => navigate("/shop")} className="back-link" />
            <h1>Payment Error</h1>
          </div>
          <div className="success-card">
            <X size={48} className="error-icon" />
            <h2>Something went wrong</h2>
            <p>
              We couldn&rsquo;t initialize your payment. Please try again or
              contact us if the issue persists.
            </p>
            <button className="primary-button" onClick={() => setStep("form")}>
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <ArrowLeft size={20} onClick={() => navigate("/shop")} className="back-link" />
          <h1>Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Your Details</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="e.g. Adeola Smith"
                error={!!errors.customerName}
              />
              {errors.customerName && (
                <span className="error-text">{errors.customerName}</span>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  placeholder="you@example.com"
                  error={!!errors.customerEmail}
                />
                {errors.customerEmail && (
                  <span className="error-text">{errors.customerEmail}</span>
                )}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="e.g. 08012345678"
                  error={!!errors.customerPhone}
                />
                {errors.customerPhone && (
                  <span className="error-text">{errors.customerPhone}</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="e.g. 12 Lagos Street, Ikeja, Lagos"
                rows={3}
                error={!!errors.deliveryAddress}
              />
              {errors.deliveryAddress && (
                <span className="error-text">{errors.deliveryAddress}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cart.map((item) => (
                <div className="order-item" key={item.optionKey || item.id}>
                  <div className="order-item-info">
                    <strong>{item.name}</strong>
                    <p className="order-item-options">
                      {item.size ? `Size: ${item.size}` : ""}
                      {item.color ? `· Color: ${item.color}` : ""}
                    </p>
                    <p className="order-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="order-item-price">{money(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "FREE" : money(deliveryFee)}</span>
              </div>
              <div className="total-row total-row-final">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="checkout-submit"
            disabled={isLoading}
          >
            {isLoading ? "Processing payment&hellip;" : "PAY NOW"}
          </button>
        </form>
      </div>
    </div>
  );
}