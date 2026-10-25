
import { useState, useEffect } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import { money } from "./utils/formatters";
import products from "./data/products";
import Checkout from "./pages/Checkout";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

function MainApp() {
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, itemCount, addItem } = useCart();
  const navigate = useNavigate();

  const addToCart = (product, selectedOptions) => {
    addItem(product, selectedOptions);
    setSelected(null);
  };

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (selected) {
      setSelectedSize(selected.defaultSize || null);
      setSelectedColor(selected.defaultColor || null);
      setQuantity(1);
    } else {
      setSelectedSize(null);
      setSelectedColor(null);
      setQuantity(1);
    }
  }, [selected]);

  const goToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <main>
      <div className="announcement">
          THE ORIGINALS DROP IS HERE — EXPLORE THE COLLECTION
          <ArrowUpRight size={14} />
        </div>

      <header className="header">
        <a className="logo" href="#home">
          DRMHUS<span> ORGNLS.</span>
        </a>

        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our Story</a>
        </nav>

        <div className="header-actions">
          {itemCount > 0 ? (
            <button
              className="cart-link"
              onClick={() => navigate("/checkout")}
              aria-label="Go to checkout"
            >
              <ShoppingBag size={19} />
              <span>Bag ({itemCount})</span>
            </button>
          ) : (
            <a className="cart-link" href="#shop">
              <ShoppingBag size={19} />
              <span>Bag ({itemCount})</span>
            </a>
          )}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="lime-dot" />
            INDEPENDENT FASHION LABEL
          </p>

          <h1>
            MADE TO
            <br />
            <span>STAND OUT.</span>
          </h1>

          <p className="hero-description">
            Original pieces for people who create their own lane.
            Discover the latest from Drmhus Orgnls.
          </p>

          <a className="primary-button" href="#shop">
            SHOP THE COLLECTION <ArrowUpRight size={18} />
          </a>

          <div className="hero-bottom">
            <span>01 / ORIGINALS COLLECTION</span>
            <span>DESIGNED TO BE DIFFERENT.</span>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src={products[0].image}
            alt="Drmhus Orgnls collection inspiration"
            className="hero-image"
          />
          <div className="hero-stamp">D/O<br />2026</div>
          <div className="hero-caption">
            <span>THE NEW UNIFORM</span>
            <ArrowDownRight size={20} />
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="Brand message">
        <div className="ticker-track">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>
              ORIGINALS ONLY <b>✳</b> NEVER ORDINARY <b>✳</b>
            </span>
          ))}
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2>THE LATEST <span>DROP.</span></h2>
          </div>
          <span className="product-count">0{products.length} PRODUCTS</span>
        </div>

        <div className="product-grid">
          {products.map((product, index) => (
            <article
              className="product-card"
              key={product.id}
              style={{ "--delay": `${index * 100}ms` }}
            >
              <button
                className="product-image-button"
                onClick={() => setSelected(product)}
                aria-label={`View ${product.name}`}
              >
                <img src={product.image} alt={product.name} />
                {product.badge && (
                  <span className="product-badge">{product.badge}</span>
                )}
                <span className="quick-view">
                  QUICK VIEW <ArrowUpRight size={16} />
                </span>
              </button>

              <div className="product-info">
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.category} · {product.color}</p>
                </div>
                <strong>{money(product.price)}</strong>
              </div>

              <button
                className="add-button"
                onClick={() => setSelected(product)}
              >
                SELECT OPTIONS <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="story-section" id="story">
        <p className="eyebrow">OUR PHILOSOPHY</p>
        <h2>DON'T FOLLOW THE FORM.<br /><span>CREATE YOUR OWN.</span></h2>
        <p>
          Drmhus Orgnls is about personal expression, original ideas,
          and everyday pieces with their own identity.
        </p>
        <a href="#shop" className="story-link">
          FIND YOUR ORIGINALS <ArrowUpRight size={18} />
        </a>
      </section>

      <footer className="footer">
        <a className="logo" href="#home">DRMHUS ORGNLS.</a>
        <p>ORIGINALS ONLY. © 2026 DRMHUS ORGNLS.</p>
        <a href="#home">BACK TO TOP ↑</a>
      </footer>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close product"
            >
              <X />
            </button>

            <img src={selected.image} alt={selected.name} />

            <div className="modal-details">
              <p className="eyebrow">{selected.category}</p>
              <h2>{selected.name}</h2>
              <h3>{money(selected.price)}</h3>

              {selected.sizes && selected.sizes.length > 0 && (
                <div className="option-group">
                  <p className="option-label">Size</p>
                  <div className="size-options">
                    {selected.sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-option ${selectedSize === size ? "active" : ""}`}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selected.colors && selected.colors.length > 0 && (
                <div className="option-group">
                  <p className="option-label">Color</p>
                  <div className="color-options">
                    {selected.colors.map((color) => (
                      <button
                        key={color.name}
                        className={`color-option ${selectedColor === color.name ? "active" : ""}`}
                        onClick={() => setSelectedColor(color.name)}
                        aria-pressed={selectedColor === color.name}
                        style={{
                          backgroundColor: color.hex,
                          borderColor:
                            color.hex === "#FFFFFF" ? "#ccc" : color.hex,
                        }}
                      >
                        <span className="color-check" aria-hidden="true">
                          ✓
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="option-group">
                <p className="option-label">Quantity</p>
                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity === 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(q + 1, selected.stock || 999)
                      )
                    }
                    disabled={quantity >= (selected.stock || 999)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {selected.stock !== undefined && selected.stock <= 5 && (
                  <p className="stock-warning">
                    Only {selected.stock} left in stock
                  </p>
                )}
              </div>

              <p className="modal-description">{selected.description}</p>

              <button
                className="primary-button"
                onClick={() =>
                  addToCart(selected, {
                    size: selectedSize || selected.defaultSize,
                    color: selectedColor || selected.defaultColor,
                  })
                }
                disabled={quantity > (selected.stock || 999)}
              >
                ADD TO BAG <ShoppingBag size={18} />
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;



