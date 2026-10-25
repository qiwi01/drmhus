import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, X, Clock, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { money } from "../utils/formatters";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState("checking"); // checking | success | failed
  const [reference, setReference] = useState("");

  useEffect(() => {
    const ref = searchParams.get("reference") || searchParams.get("trxref");
    if (!ref) {
      setStatus("failed");
      return;
    }
    setReference(ref);
    verifyPayment(ref);
  }, [searchParams]);

  const verifyPayment = async (ref) => {
    try {
      const res = await fetch(`${API}/api/payments/verify/${ref}`);
      const data = await res.json();

      if (data.status === "paid") {
        setStatus("success");
        clearCart();
      } else {
        setStatus("failed");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setStatus("failed");
    }
  };

  return (
    <div className="callback-page">
      <div className="callback-container">
        <div className="callback-header">
          <ArrowLeft size={20} onClick={() => navigate("/")} className="back-link" />
          <h1>Payment Status</h1>
        </div>

        {status === "checking" && (
          <div className="callback-card checking">
            <Clock size={48} className="checking-icon" />
            <h2>Verifying payment…</h2>
            <p>Please wait while we confirm your order.</p>
          </div>
        )}

        {status === "success" && (
          <div className="callback-card success">
            <CheckCircle size={48} className="success-icon" />
            <h2>Payment Successful</h2>
            <p>
              Your order <strong>{reference}</strong> has been confirmed.
              Thank you for shopping with DRMHUS ORGNLS.
            </p>
            <div className="order-total">
              Order total: <strong>{money(0)}</strong>
            </div>
            <button
              className="primary-button"
              onClick={() => navigate("/")}
            >
              BACK TO SHOP
            </button>
          </div>
        )}

        {status === "failed" && (
          <div className="callback-card failed">
            <X size={48} className="error-icon" />
            <h2>Payment Failed</h2>
            <p>
              We weren't able to confirm your payment. Please try again or
              contact us if the issue persists.
            </p>
            <button
              className="primary-button"
              onClick={() => navigate("/checkout")}
            >
              TRY AGAIN
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate("/")}
            >
              BACK TO SHOP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}