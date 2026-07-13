import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";
import Cook from "./models/Cook.js";
import Menu from "./models/Menu.js";
import Order from "./models/Order.js";
import Dispute from "./models/Dispute.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Permits connection requests across ports

const normalizeKitchenData = (kitchen) => {
  if (!kitchen) return null;
  const plain = kitchen.toObject ? kitchen.toObject() : kitchen;
  return {
    ...plain,
    name: plain.kitchenName || plain.name || "Kitchen",
    description: plain.description || plain.bio || "No profile description provided yet.",
    location: plain.location || plain.serviceArea || "Location not provided",
    preference: plain.preference || plain.mealTypePreference || "VEG",
    bannerImage: plain.bannerImage || "",
    cuisines: plain.cuisines || plain.cuisineTypes || [],
    kitchenName: plain.kitchenName || plain.name || "Kitchen",
  };
};

const normalizeMenuItem = (item) => {
  const plain = item.toObject ? item.toObject() : item;
  return {
    ...plain,
    name: plain.title || plain.name || "Dish",
    description: plain.description || "",
    price: Number(plain.price) || 0,
    category: plain.category || "General",
    image: plain.image || plain.imageUrl || "",
  };
};
 
// 1. Connection Hook to MongoDB Local Instance
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/homefeast";
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB Database Connected Successfully."))
  .catch((err) => console.error("❌ Connection Error:", err));

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch users collection" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found in database." });
    }

    res.status(200).json({
      message: "User successfully deleted from database.",
      deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user from database:", error);
    res.status(500).json({ message: "Server error while attempting to delete user.", error: error.message });
  }
});

// 3. User Registration Routing Link
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "❌ Email is already registered!" });
    }

    // Encrypt password using salt hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "🎉 Account created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// 4. Authentication User Login Routing Link
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "❌ Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "❌ Invalid email or password." });
    }

    res.status(200).json({
      message: "🎉 Signed in successfully!",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Added: Vendor Login Routing Link
app.post("/api/vendor/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Cook.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "❌ Vendor kitchen not found." });
    }

    const storedPassword = vendor.password || "";
    const isMatch = storedPassword
      ? storedPassword.startsWith('$2')
        ? await bcrypt.compare(password, storedPassword)
        : password === storedPassword
      : password === "password123";

    if (!isMatch) {
      return res.status(400).json({ message: "❌ Invalid email or password." });
    }

    res.status(200).json({
      message: "🎉 Vendor dashboard access authorized!",
      vendor: {
        id: vendor._id,
        email: vendor.email,
        kitchenName: vendor.kitchenName,
        chefName: vendor.chefName,
        serviceArea: vendor.serviceArea,
      },
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({ message: "Server error during vendor login." });
  }
});

// 5. Fetch Cooks API
//    - Admin and dashboard consumers get the full list.
//    - Homepage can request only approved kitchens with ?approved=true.
app.get("/api/cooks", async (req, res) => {
  try {
    const filter = {};
    if (req.query.approved === "true") {
      filter.status = "Approved";
    }

    const cooks = await Cook.find(filter);
    res.status(200).json(cooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching cooks." });
  }
});

app.post("/api/vendors/signup", async (req, res) => {
  try {
    const {
      kitchenName,
      chefName,
      email,
      password, // Capture incoming password if present
      phone,
      serviceArea,
      mealTypePreference,
      cuisineTypes,
      pricingPlans,
    } = req.body;

    // Validation
    if (!kitchenName || !serviceArea || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let vendorExists = await Cook.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: "❌ This kitchen email is already registered!" });
    }

    // Encrypt password if provided, else use fallback string
    let finalPassword = password || "password123";
    if (password) {
      const salt = await bcrypt.genSalt(10);
      finalPassword = await bcrypt.hash(password, salt);
    }

    // Create new Cook document
    const newVendor = new Cook({
      kitchenName,
      chefName,
      email,
      password: finalPassword,
      phone,
      serviceArea,
      mealTypePreference,
      cuisineTypes,
      pricingPlans,
      isVerified: false,
      status: "Pending Approval",
    });

    await newVendor.save();

    res.status(201).json({
      message: "🎉 Vendor registration received successfully.",
      vendor: newVendor,
    });
  } catch (error) {
    console.error("Vendor signup error:", error);
    res.status(500).json({ message: "Server error during vendor signup." });
  }
});

app.get("/api/subscriptions", async (req, res) => {
  res.status(200).json([]);
});

app.get("/api/disputes", async (req, res) => {
  try {
    const disputes = await Dispute.find({}).sort({ createdAt: -1 });
    res.status(200).json(disputes);
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({ message: "Server error while fetching disputes." });
  }
});

app.post("/api/disputes", async (req, res) => {
  try {
    const { role, name, email, vendorName, orderId, issue } = req.body || {};

    if (!name || !email || !issue) {
      return res.status(400).json({ message: "Name, email, and issue description are required." });
    }

    const dispute = new Dispute({
      role,
      name,
      email,
      vendorName,
      orderId,
      issue,
    });

    await dispute.save();
    res.status(201).json({ message: "Complaint submitted successfully.", dispute });
  } catch (error) {
    console.error("Error creating dispute:", error);
    res.status(500).json({ message: "Failed to submit complaint." });
  }
});

app.get("/api/cuisines", async (req, res) => {
  res.status(200).json(["Punjabi", "South Indian", "Continental", "Chinese"]);
});

app.post("/api/cuisines", async (req, res) => {
  const cuisineName = req.body?.name || req.body;
  res.status(201).json(typeof cuisineName === "string" ? cuisineName : { name: cuisineName });
});

app.delete("/api/cuisines/:id", async (req, res) => {
  res.status(200).json({ message: "Cuisine removed." });
});

app.patch("/api/cooks/:id/approve", async (req, res) => {
  try {
    const cook = await Cook.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, status: "Approved" },
      { new: true }
    );
    if (!cook) {
      return res.status(404).json({ message: "Cook not found" });
    }
    res.status(200).json({ message: "Cook approval updated.", cook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve cook." });
  }
});

app.patch("/api/disputes/:id/resolve", async (req, res) => {
  try {
    const updatedDispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved" },
      { new: true }
    );

    if (!updatedDispute) {
      return res.status(404).json({ message: "Dispute not found." });
    }

    res.status(200).json({ message: "Dispute resolved.", dispute: updatedDispute });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    res.status(500).json({ message: "Failed to resolve dispute." });
  }
});

// 6. Kitchen Profile Endpoints
app.get("/api/kitchens/:id", async (req, res) => {
  try {
    const kitchen = await Cook.findById(req.params.id);
    if (!kitchen) {
      return res.status(404).json({ message: "Kitchen not found" });
    }
    res.status(200).json(normalizeKitchenData(kitchen));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching kitchen profile" });
  }
});

app.put("/api/kitchens/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const kitchen = await Cook.findByIdAndUpdate(
      req.params.id,
      {
        kitchenName: payload.name || payload.kitchenName,
        description: payload.description,
        serviceArea: payload.location || payload.serviceArea,
        mealTypePreference: payload.preference,
        bannerImage: payload.bannerImage,
        cuisineTypes: payload.cuisines || payload.cuisineTypes || [],
      },
      { new: true, runValidators: true }
    );
    if (!kitchen) {
      return res.status(404).json({ message: "Kitchen not found" });
    }
    res.status(200).json({ message: "Kitchen updated successfully", kitchen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating kitchen profile" });
  }
});

app.patch("/api/kitchens/:id/rating", async (req, res) => {
  try {
    const { delta, value } = req.body || {};
    const kitchen = await Cook.findById(req.params.id);

    if (!kitchen) {
      return res.status(404).json({ message: "Kitchen not found" });
    }

    const currentRating = Number(kitchen.rating || 0);
    const parsedDelta = Number(delta || 0);
    const parsedValue = Number(value);
    const nextRating = Number.isFinite(parsedValue)
      ? parsedValue
      : currentRating + parsedDelta;

    const clampedRating = Math.max(0, Math.min(5, Number(nextRating.toFixed(1))));
    kitchen.rating = clampedRating;
    await kitchen.save();

    res.status(200).json({ message: "Rating updated successfully", kitchen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating kitchen rating" });
  }
});

// 7. Menu Endpoints
app.get("/api/menu", async (req, res) => {
  try {
    const { kitchenId } = req.query;
    const query = kitchenId ? { kitchenId } : {};
    const menuItems = await Menu.find(query);
    res.status(200).json(menuItems.map(normalizeMenuItem));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching menu items" });
  }
});

app.post("/api/menu", async (req, res) => {
  try {
    const { name, price, category, description, kitchenId, cook, mealType, image } = req.body;

    if (!name || !price || !kitchenId) {
      return res.status(400).json({ message: "Missing required fields: name, price, kitchenId" });
    }

    const newMenuItem = new Menu({
      kitchenId,
      cook: cook || kitchenId,
      title: name,
      description,
      price: Number(price),
      category,
      mealType: mealType || "Veg",
      image: image || "",
      availability: true,
      mealPlanType: ["daily"],
    });

    await newMenuItem.save();
    res.status(201).json(normalizeMenuItem(newMenuItem));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating menu item" });
  }
});

app.delete("/api/menu/:id", async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting menu item" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const { vendorId, userEmail } = req.query;
    const query = {};

    if (vendorId) query.vendorId = vendorId;
    if (userEmail) query.userEmail = userEmail;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.userEmail) {
      return res.status(400).json({ message: "User email is required to place an order." });
    }

    const newOrder = new Order({
      userEmail: payload.userEmail,
      userName: payload.userName || "Guest",
      customerPhone: payload.customerPhone || payload.deliveryAddress?.phone || "",
      vendorId: payload.vendorId || "",
      vendorName: payload.vendorName || "",
      deliveryOption: payload.deliveryOption || "homeDelivery",
      paymentMethod: payload.paymentMethod || "cod",
      deliveryAddress: payload.deliveryAddress || null,
      pickupLocation: payload.pickupLocation || null,
      cartItems: payload.cartItems || [],
      subtotal: Number(payload.subtotal) || 0,
      deliveryFee: Number(payload.deliveryFee) || 0,
      cardDetails: payload.cardDetails || null,
      upiId: payload.upiId || null,
      totalAmount: Number(payload.totalAmount) || 0,
      status: payload.status || "Placed",
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error placing order" });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status, deliveryStatus, vendorReview } = req.body || {};
    const update = {};

    if (status) update.status = status;
    if (deliveryStatus) update.deliveryStatus = deliveryStatus;
    if (vendorReview !== undefined) {
      update.vendorReview = vendorReview;
      update.reviewSentAt = vendorReview ? new Date() : null;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "At least one update field is required." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order updated successfully.", order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating order" });
  }
});

app.listen(5000, () => console.log("🚀 Backend running on port 5000"));