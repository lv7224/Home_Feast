import mongoose from "mongoose";

const CookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  kitchenName: { type: String, required: true },
  chefName: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  serviceTypes: [
    {
      type: String,
      enum: ["Catering Service", "Tiffin Service", "Home Chef"],
    },
  ],
  cuisineTypes: [{ type: String }],
  serviceArea: { type: String, required: true },
  mealTypePreference: {
    type: String,
    enum: ["Veg", "Non-Veg", "Both"],
    default: "Veg",
  },
  pricingPlans: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ["Pending Approval", "Approved"],
    default: "Pending Approval",
  },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Cook", CookSchema);

