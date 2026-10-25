
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  },
});

app.use("/uploads/products", express.static(uploadDir));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", store: "Drmhus Orgnls" });
});

const DELIVERY_FEE = 2500;
const FREE_SHIPPING_THRESHOLD = 50000;

app.post("/api/payments/initialize", async (req, res) => {
  try {
    const { email, items, customerName, customerPhone, deliveryAddress } = req.body;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res.status(400).json({
        message: "Provide a valid email and cart items.",
      });
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.id);
      const quantity = Number(item.quantity);

      if (!product || !product.isActive) {
        return res.status(400).json({ message: "Invalid or inactive product." });
      }
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ message: "Invalid quantity." });
      }
      if (quantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} left in stock for ${product.name}.`,
        });
      }

      subtotal += product.price * quantity;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        size: item.size || "",
        color: item.color || "",
        optionKey: `${item.size || "default"}|${item.color || "default"}`,
      });
    }

    if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
      return res.status(400).json({ message: "Invalid order total." });
    }

    const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const reference = `drm_${crypto.randomUUID()}`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: total * 100,
        currency: "NGN",
        reference,
        callback_url: `${process.env.CLIENT_URL}/payment/callback`,
        metadata: {
          store: "Drmhus Orgnls",
          reference,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.status) {
      return res.status(502).json({ message: "Unable to initialize payment." });
    }

    const order = new Order({
      reference,
      customerName: customerName || "",
      customerEmail: email,
      customerPhone: customerPhone || "",
      deliveryAddress: deliveryAddress || "",
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
      status: "pending",
    });

    await order.save();

    return res.json({
      authorizationUrl: response.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Payment initialization failed:", error.response?.data || error.message);
    return res.status(500).json({ message: "Payment could not be initialized." });
  }
});

app.get("/api/payments/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const order = await Order.findOne({ reference });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Idempotency: if already verified, return cached result
    if (order.paymentVerified && order.status === "paid") {
      return res.json({ reference, status: "paid", alreadyVerified: true });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment = response.data.data;

    const paid =
      response.data.status === true &&
      payment.status === "success" &&
      payment.reference === reference &&
      payment.currency === "NGN" &&
      payment.amount === order.total * 100;

    if (paid) {
      order.status = "paid";
      order.paymentVerified = true;
      order.paymentReference = reference;
      await order.save();

      // Decrement stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    return res.json({
      reference,
      status: paid ? "paid" : payment.status,
    });
  } catch (error) {
    console.error("Payment verification failed:", error.response?.data || error.message);
    return res.status(500).json({ message: "Unable to verify payment." });
  }
});

// ---------- PAYSTACK WEBHOOK (server-side confirmation) ----------

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body.toString("utf8"))
      .digest("hex");

    const signature = req.headers["x-paystack-signature"];
    if (!signature || signature !== hash) {
      return res.status(401).json({ message: "Invalid webhook signature." });
    }

    const event = JSON.parse(req.body.toString("utf8"));
    const { event: eventType, data } = event;

    if (eventType === "charge.success") {
      const reference = data.reference;
      const amountKobo = data.amount;

      const order = await Order.findOne({ reference });
      if (!order) {
        console.warn("Webhook: order not found for reference", reference);
        return res.status(200).json({ received: true });
      }

      if (order.paymentVerified && order.status === "paid") {
        return res.status(200).json({ received: true, duplicate: true });
      }

      if (amountKobo !== order.total * 100) {
        console.warn("Webhook: amount mismatch", reference);
        return res.status(400).json({ message: "Amount mismatch." });
      }

      order.status = "paid";
      order.paymentVerified = true;
      order.paymentReference = reference;
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      console.log("Webhook: order fulfilled", reference);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(500).json({ message: "Webhook processing failed." });
  }
});

// ---------- ADMIN: PRODUCTS ----------

app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Admin fetch products failed:", error);
    res.status(500).json({ message: "Unable to fetch products." });
  }
});

app.post("/api/admin/products", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      stock,
      defaultSize,
      defaultColor,
      sizes,
      colors,
      badge,
      isActive,
      images,
    } = req.body;

    const product = new Product({
      name,
      category,
      price: Number(price),
      description: description || "",
      stock: Number(stock) || 0,
      defaultSize: defaultSize || "",
      defaultColor: defaultColor || "",
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      image: req.file ? `/uploads/products/${req.file.filename}` : "",
      images: images ? JSON.parse(images) : [],
      badge: badge || "",
      isActive: isActive !== "false",
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Admin create product failed:", error);
    res.status(500).json({ message: "Unable to create product." });
  }
});

app.put("/api/admin/products/:id", upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.sizes) updates.sizes = JSON.parse(updates.sizes);
    if (updates.colors) updates.colors = JSON.parse(updates.colors);
    if (updates.images) updates.images = JSON.parse(updates.images);
    if (updates.isActive !== undefined) updates.isActive = updates.isActive !== "false";
    if (req.file) updates.image = `/uploads/products/${req.file.filename}`;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (error) {
    console.error("Admin update product failed:", error);
    res.status(500).json({ message: "Unable to update product." });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Admin delete product failed:", error);
    res.status(500).json({ message: "Unable to delete product." });
  }
});

// ---------- ADMIN: ORDERS ----------

app.get("/api/admin/orders", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Admin fetch orders failed:", error);
    res.status(500).json({ message: "Unable to fetch orders." });
  }
});

app.put("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "paid", "fulfilled", "cancelled", "refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found." });

    if (status === "fulfilled" && !order.fulfilledAt) {
      order.fulfilledAt = new Date();
      await order.save();
    }

    res.json(order);
  } catch (error) {
    console.error("Admin update order status failed:", error);
    res.status(500).json({ message: "Unable to update order." });
  }
});

app.get("/api/admin/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (error) {
    console.error("Admin fetch order failed:", error);
    res.status(500).json({ message: "Unable to fetch order." });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Drmhus API running on port ${port}`);
});
