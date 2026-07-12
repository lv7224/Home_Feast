import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cook', required: true },
  planType: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  mealType: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'active', 'paused', 'completed'], default: 'pending' },
  pricePaid: { type: Number, required: true }
});

export default mongoose.model('Subscription', SubscriptionSchema);
    