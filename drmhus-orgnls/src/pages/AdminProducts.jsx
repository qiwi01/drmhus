import { useState, useEffect } from "react";
import { Plus, Trash2, Upload, Edit3, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { money } from "../utils/formatters";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "T-Shirts",
    price: "",
    description: "",
    stock: "",
    defaultSize: "",
    defaultColor: "",
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    colors: JSON.stringify([
      { name: "Black", hex: "#101010" },
      { name: "White", hex: "#FFFFFF" },
    ]),
    badge: "",
    isActive: "true",
    images: JSON.stringify([]),
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/admin/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "T-Shirts",
      price: "",
      description: "",
      stock: "",
      defaultSize: "",
      defaultColor: "",
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([
        { name: "Black", hex: "#101010" },
        { name: "White", hex: "#FFFFFF" },
      ]),
      badge: "",
      isActive: "true",
      images: JSON.stringify([]),
    });
    setImageFile(null);
    setEditing(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("defaultSize", form.defaultSize);
    formData.append("defaultColor", form.defaultColor);
    formData.append("sizes", form.sizes);
    formData.append("colors", form.colors);
    formData.append("badge", form.badge);
    formData.append("isActive", form.isActive);
    formData.append("images", form.images);
    if (imageFile) formData.append("image", imageFile);

    try {
      const url = editing
        ? `${API}/api/admin/products/${editing}`
        : `${API}/api/admin/products`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save product.");
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const editProduct = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || "",
      stock: product.stock,
      defaultSize: product.defaultSize || "",
      defaultColor: product.defaultColor || "",
      sizes: JSON.stringify(product.sizes || []),
      colors: JSON.stringify(product.colors || []),
      badge: product.badge || "",
      isActive: product.isActive !== false ? "true" : "false",
      images: JSON.stringify(product.images || []),
    });
    setEditing(product._id);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product.");
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (product) => {
    try {
      const res = await fetch(
        `${API}/api/admin/products/${product._id}`,
        {
          method: "PUT",
          body: JSON.stringify({ isActive: !product.isActive }),
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Failed to update.");
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1>Loading products...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <ArrowLeft size={20} onClick={() => navigate("/")} className="back-link" />
          <h1>Store Management</h1>
        </div>

        {editing ? (
          <div className="admin-card">
            <h2>Edit Product</h2>
            <button
              className="cancel-btn"
              onClick={resetForm}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="admin-header-actions">
            <button className="add-btn" onClick={resetForm}>
              <Plus size={18} />
              Add Product
            </button>
          </div>
        )}

        {error && <div className="admin-error">{error}</div>}

        <div className="product-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (NGN)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Default Size</label>
                <input
                  type="text"
                  name="defaultSize"
                  value={form.defaultSize}
                  onChange={(e) =>
                    setForm({ ...form, defaultSize: e.target.value })
                  }
                  placeholder="e.g. M"
                />
              </div>
              <div className="form-group">
                <label>Default Color</label>
                <input
                  type="text"
                  name="defaultColor"
                  value={form.defaultColor}
                  onChange={(e) =>
                    setForm({ ...form, defaultColor: e.target.value })}
                  placeholder="e.g. Black"
                />
              </div>
              <div className="form-group">
                <label>Sizes (JSON array)</label>
                <textarea
                  name="sizes"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder='["S", "M", "L", "XL"]'
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Colors (JSON array)</label>
                <textarea
                  name="colors"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder='[{"name": "Black", "hex": "#101010"}]'
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Badge</label>
                <input
                  type="text"
                  name="badge"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="e.g. BESTSELLER"
                />
              </div>
              <div className="form-group full-width">
                <label>Image Upload</label>
                <div className="upload-zone">
                  <Upload size={20} />
                  <p>
                    {imageFile ? imageFile.name : "Choose product image"}{
                      " "
                    }(JPEG, PNG, WebP, max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="browse-btn"
                    onClick={() =>
                      e.currentTarget.parentElement.querySelector(
                        'input[type="file"]'
                      )?.click()
                    }
                  >
                    Browse
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isActive === "true"}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked ? "true" : "false" })}
                  />
                  Active
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="save-btn"
              disabled={submitting}
            >
              {submitting ? "Saving..." : editing ? "Update Product" : "Create Product"}
            </button>
          </form>
        </div>

        <div className="products-list">
          <h2>Products ({products.length})</h2>
          <div className="products-table">
            {products.map((product) => (
              <div className="product-row" key={product._id}>
                <div className="product-row-image">
                  {product.image ? (
                    <img src={`${API}${product.image}`} alt={product.name} />
                  ) : (
                    <div className="no-image">No image</div>
                  )}
                </div>
                <div className="product-row-info">
                  <div className="product-row-name">{product.name}</div>
                  <div className="product-row-meta">
                    {product.category} · {money(product.price)} · Stock: {product.stock}
                  </div>
                  {product.badge && (
                    <span className="badge">{product.badge}</span>
                  )}
                </div>
                <div className="product-row-actions">
                  <button
                    className="icon-btn edit"
                    onClick={() => editProduct(product)}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-btn delete"
                    onClick={() => deleteProduct(product._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    className={`icon-btn toggle ${product.isActive ? "active" : "inactive"}`}
                    onClick={() => toggleActive(product)}
                    title={product.isActive ? "Deactivate" : "Activate"}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}