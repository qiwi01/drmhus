const products = [
  {
    id: "drm-001",
    name: "Essential Box Tee",
    category: "T-Shirts",
    price: 18000,
    color: "Black",
    defaultColor: "Black",
    defaultSize: "M",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "BESTSELLER",
    stock: 12,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#101010" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Lime", hex: "#C7F464" },
    ],
    description:
      "Our signature box-fit tee in heavyweight cotton. Cut for comfort, built to stand out. The foundation of every original wardrobe.",
  },
  {
    id: "drm-002",
    name: "Originals Heavy Tee",
    category: "T-Shirts",
    price: 22000,
    color: "White",
    defaultColor: "White",
    defaultSize: "M",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "NEW DROP",
    stock: 8,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#101010" },
    ],
    description:
      "Premium heavyweight cotton with a crisp finish. Made for those who carry originality in every thread.",
  },
  {
    id: "drm-003",
    name: "Signature Hoodie",
    category: "Hoodies",
    price: 35000,
    color: "Black",
    defaultColor: "Black",
    defaultSize: "L",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "",
    stock: 5,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#101010" },
      { name: "Neutral", hex: "#F5F3EE" },
    ],
    description:
      "Oversized hoodie in brushed fleece. Embroidered with the Drmhus Orgnls mark. Built for cold mornings and bolder nights.",
  },
  {
    id: "drm-004",
    name: "Street Essential",
    category: "T-Shirts",
    price: 20000,
    color: "Neutral",
    defaultColor: "Neutral",
    defaultSize: "M",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "LIMITED",
    stock: 3,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Neutral", hex: "#F5F3EE" },
      { name: "Black", hex: "#101010" },
    ],
    description:
      "Limited-run essential tee. Neutral tone, original cut. Once they're gone, they're gone.",
  },
];

export default products;