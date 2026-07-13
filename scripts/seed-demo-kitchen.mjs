import mongoose from 'mongoose';
import Cook from '../backend/models/Cook.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homefeast';
const imageUrl = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80';

try {
  await mongoose.connect(mongoUri);

  const result = await Cook.findOneAndUpdate(
    {
      kitchenName: { $regex: /^aniket tiffin service$/i },
      serviceArea: { $regex: /^dadri$/i },
    },
    {
      $set: {
        bannerImage: imageUrl,
        kitchenName: 'Aniket Tiffin Service',
        serviceArea: 'Dadri',
        status: 'Approved',
        mealTypePreference: 'Both',
        cuisineTypes: ['North Indian', 'Tiffin'],
      },
      $setOnInsert: {
        email: 'aniket@example.com',
        password: 'password123',
        chefName: 'Aniket',
        phone: '9999999999',
        pricingPlans: { daily: 120, weekly: 700, monthly: 2500 },
      },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(JSON.stringify({
    id: result._id.toString(),
    kitchenName: result.kitchenName,
    serviceArea: result.serviceArea,
    bannerImage: result.bannerImage,
    status: result.status,
  }, null, 2));
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
