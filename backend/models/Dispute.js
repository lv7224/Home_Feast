import mongoose from 'mongoose';

const DisputeSchema = new mongoose.Schema({
  role: { type: String, enum: ['User', 'Vendor'], default: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  vendorName: { type: String, default: '' },
  orderId: { type: String, default: '' },
  issue: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Dispute', DisputeSchema);
