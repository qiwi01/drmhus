const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, trim: "" },
  color: { type: String, trim: "" },
  optionKey: { type: String, trim: "" },
});

const orderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, trim: "" },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, trim: "" },
    deliveryAddress: { type: String, trim: "" },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "paid", "fulfilled", "cancelled", "refunded"],
      default: "pending",
    },
    paymentReference: { type: String, trim: "" },
    paymentVerified: { type: Boolean, default: false },
    fulfilledAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerEmail: 1 });

module.exports = mongoose.model("Order", orderSchema);