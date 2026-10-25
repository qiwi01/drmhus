const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: "" },
    stock: { type: Number, required: true, default: 0, min: 0 },
    defaultSize: { type: String, trim: "" },
    defaultColor: { type: String, trim: "" },
    sizes: [{ type: String, trim: true }],
    colors: [
      {
        name: { type: String, required: true, trim: true },
        hex: { type: String, required: true, trim: true },
      },
    ],
    image: { type: String, trim: "" },
    images: [{ type: String, trim: "" }],
    badge: { type: String, trim: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", category: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", productSchema);