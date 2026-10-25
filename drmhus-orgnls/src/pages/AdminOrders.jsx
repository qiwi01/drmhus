import { useState, useEffect } from "react";
import { ArrowLeft, Package, CreditCard, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { money } from "../utils/formatters";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_ORDER = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
];

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url = filter === "all"
        ? `${API}/api/admin/orders`
        : `${API}/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setSubmittingId(id);
    try {
      const res = await fetch(`${API}/api/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      await fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const statusColor = (status) => {
    const map = {
      pending: "#101010",
      paid: "#0a8a38",
      fulfilled: "#c7f464",
      cancelled: "#b00020",
      refunded: "#777777",
    };
    return map[status] || "#101010";
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1>Loading orders...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <ArrowLeft size={20} onClick={() => navigate("/")} className="back-link" />
          <h1>Order Management</h1>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="orders-filter">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s === "all" ? "all" : s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {orders.filter((o) => o.status === s).length > 0 && (
                <span className="badge-count">
                  {orders.filter((o) => o.status === s).length}
                </span>
              )}
            </button>
          ))}
          <button
            className="filter-btn refresh"
            onClick={fetchOrders}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-row">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="ref-cell">{order.reference}</td>
                    <td>{order.customerName || "—"}</td>
                    <td>{order.customerEmail}</td>
                    <td>
                      {order.items.length} item{
                        order.items.length !== 1 ? "s" : ""
                      }
                    </td>
                    <td>{money(order.total)}</td>
                    <td>
                      <span
                        className={`status-badge ${order.status}`}
                        style={{ color: statusColor(order.status) }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="actions-cell">
                      {STATUS_ORDER.map((s) => (
                        <button
                          key={s}
                          className={`status-btn ${
                            order.status === s ? "active" : ""
                          }`}
                          disabled={submittingId === order._id}
                          onClick={() => updateStatus(order._id, s)}
                          title={s}
                        >
                          {s.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}