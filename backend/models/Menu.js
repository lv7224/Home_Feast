// import mongoose from "mongoose";

// const MenuSchema = new mongoose.Schema({
// kitchenId: { type: mongoose.Schema.Types.ObjectId, ref: "Cook", required: true },
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   category: { type: String },
//   description: { type: String },
//   image: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("Menu", MenuSchema);

import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema(
 {
  kitchenId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Cook",
   required: true,
  },
  cook: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   required: true,
  },
  title: {
   type: String,
   required: true,
   trim: true,
  },
  description: {
   type: String,
   trim: true,
  },
  price: {
   type: Number,
   required: true,
   min: 0,
  },
  mealType: {
   type: String,
   enum: ["Veg", "Non-Veg"],
   required: true,
  },
  category: {
   type: String, // e.g. "Gujarati Thali", "South Indian Breakfast", "Biryani"
   trim: true,
  },
  image: {
   type: String,
   default: "",
  },
  availability: {
   type: Boolean,
   default: true,
  },
  mealPlanType: {
   type: [String], // e.g. ['daily', 'weekly', 'monthly']
   enum: ["daily", "weekly", "monthly"],
   default: ["daily"],
  },
 },
 {
  timestamps: true,
 },
);

const Menu = mongoose.model("Menu", MenuSchema);
export default Menu;
