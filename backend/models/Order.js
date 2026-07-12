import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, trim: true },
  userName: { type: String, default: 'Guest' },
  customerPhone: { type: String, default: '' },
  vendorId: { type: String, default: '' },
  vendorName: { type: String, default: '' },
  deliveryOption: { type: String, enum: ['homeDelivery', 'selfPickup'], default: 'homeDelivery' },
  paymentMethod: { type: String, enum: ['cod', 'upi', 'card'], default: 'cod' },
  deliveryAddress: {
    fullAddress: String,
    city: String,
    pincode: String,
    phone: String,
  },
  pickupLocation: { type: String },
  cartItems: [{ id: String, name: String, price: Number, qty: Number }],
  subtotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  cardDetails: {
    cardNumber: String,
    expiry: String,
    cvv: String,
  },
  upiId: { type: String },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, default: 'Placed' },
  deliveryStatus: { type: String, enum: ['Pending', 'Delivered', 'Not Accepted'], default: 'Pending' },
  vendorReview: { type: String, default: '' },
  reviewSentAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', OrderSchema);
