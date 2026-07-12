import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Cook() {
  const { vendorId } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Kitchen Profile Details
  const [profile, setProfile] = useState({
    name: "",
    description: "",
    location: "",
    preference: "VEG",
    bannerImage: ""
  });

  // State for Menu Items
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);

  // State for New Dish Form
  const [newDish, setNewDish] = useState({ name: '', price: '', category: '', description: '', image: '' });

  // 1. FETCH DATA FROM MONGODB (ON LOAD)
  useEffect(() => {
    if (!vendorId) return;

    const fetchVendorData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch Profile from your API (e.g., Node/Express connected to MongoDB)
        // Replace with your actual backend URL: `http://localhost:5000/api/kitchens/${vendorId}`
        const profileRes = await fetch(`/api/kitchens/${vendorId}`);
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch Menu Items from your API
        // Replace with your actual backend URL: `http://localhost:5000/api/menu?kitchenId=${vendorId}`
        const menuRes = await fetch(`/api/menu?kitchenId=${vendorId}`);
        if (!menuRes.ok) throw new Error("Failed to fetch menu");
        const menuData = await menuRes.json();
        setMenuItems(menuData);

        const ordersRes = await fetch(`/api/orders?vendorId=${vendorId}`);
        if (!ordersRes.ok) throw new Error("Failed to fetch orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 2. SAVE PROFILE EDITS TO MONGODB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/kitchens/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (!response.ok) throw new Error("Failed to update profile");
      alert("Kitchen profile updated successfully!");
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  };

  // 3. SAVE NEW DISH TO MONGODB
  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!newDish.name || !newDish.price) return;
    
    const dishPayload = {
      name: newDish.name,
      price: parseFloat(newDish.price),
      category: newDish.category,
      description: newDish.description,
      image: newDish.image,
      kitchenId: vendorId,
      cook: vendorId,
      mealType: 'Veg'
    };

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishPayload)
      });

      if (!response.ok) throw new Error("Failed to add dish");
      
      const savedDish = await response.json(); // Backend should return the created MongoDB document with its _id
      
      setMenuItems([...menuItems, savedDish]);
      setNewDish({ name: '', price: '', category: '', description: '', image: '' }); // Reset form
    } catch (err) {
      alert("Error adding dish: " + err.message);
    }
  };

  // 4. DELETE DISH FROM MONGODB
  const handleDeleteDish = async (dishId) => {
    // Optimistic UI update (remove from screen immediately)
    const previousMenu = [...menuItems];
    setMenuItems(menuItems.filter(item => item._id !== dishId));

    try {
      const response = await fetch(`/api/menu/${dishId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error("Failed to delete dish");
      }
    } catch (err) {
      // Revert if API fails
      setMenuItems(previousMenu);
      alert("Error deleting dish: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');
      const updatedOrder = await response.json();
      setOrders((prevOrders) => prevOrders.map((order) => (order._id === orderId ? updatedOrder.order : order)));
    } catch (err) {
      alert('Error updating order: ' + err.message);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId, deliveryStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus }),
      });

      if (!response.ok) throw new Error('Failed to update delivery status');
      const updatedOrder = await response.json();
      setOrders((prevOrders) => prevOrders.map((order) => (order._id === orderId ? updatedOrder.order : order)));
    } catch (err) {
      alert('Error updating delivery status: ' + err.message);
    }
  };

  const handleSendReview = async (orderId, reviewText) => {
    if (!reviewText?.trim()) {
      alert('Please enter a review message.');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorReview: reviewText.trim() }),
      });

      if (!response.ok) throw new Error('Failed to send review');
      const updatedOrder = await response.json();
      setOrders((prevOrders) => prevOrders.map((order) => (order._id === orderId ? updatedOrder.order : order)));
      alert('Review sent to customer.');
    } catch (err) {
      alert('Error sending review: ' + err.message);
    }
  };

  if (!vendorId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        No kitchen ID provided.
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-r shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-orange-600">Home Feast</h2>
          <p className="text-xs text-gray-500 mt-1">Vendor Dashboard</p>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            🍳 Kitchen Profile
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'menu' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            📋 Manage Menu
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            🛒 Customer Orders
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 lg:p-10">
        
        {/* === KITCHEN PROFILE TAB === */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Kitchen Profile</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kitchen Name</label>
                  <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-orange-500 focus:border-orange-500 outline-none" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={profile.description} onChange={handleProfileChange} rows="3" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-orange-500 focus:border-orange-500 outline-none" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" name="location" value={profile.location} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
                    <select name="preference" value={profile.preference} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none">
                      <option value="VEG">Vegetarian Only</option>
                      <option value="NON_VEG">Non-Vegetarian</option>
                      <option value="BOTH">Veg & Non-Veg</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                  <input type="url" name="bannerImage" value={profile.bannerImage} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none" />
                </div>

                <div className="pt-4 border-t">
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MANAGE MENU TAB === */}
        {activeTab === 'orders' && (
          <div className="max-w-6xl animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Orders</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 text-sm font-bold text-gray-700 flex justify-between">
                <span>Recent Orders</span>
                <span>{orders.length} Orders</span>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 text-sm">No orders yet.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="p-6 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{order.userName || 'Customer'}</h4>
                          <p className="text-sm text-gray-600">{order.userEmail}</p>
                          {order.customerPhone && <p className="text-sm text-gray-500">Phone: {order.customerPhone}</p>}
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                          <p className="font-semibold text-gray-700">Total: ₹{order.totalAmount}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Items</p>
                        {order.cartItems?.length ? order.cartItems.map((item, idx) => (
                          <div key={`${order._id}-${idx}`} className="flex justify-between text-sm text-gray-600">
                            <span>{item.qty}x {item.name}</span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        )) : <p className="text-sm text-gray-500">No item details available.</p>}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Delivery: {order.deliveryOption === 'selfPickup' ? 'Self Pickup' : 'Home Delivery'}</p>
                          {order.deliveryOption === 'homeDelivery' && order.deliveryAddress && (
                            <p className="text-gray-500">Address: {order.deliveryAddress.fullAddress}, {order.deliveryAddress.city}</p>
                          )}
                          {order.deliveryOption === 'selfPickup' && order.pickupLocation && (
                            <p className="text-gray-500">Pickup Location: {order.pickupLocation}</p>
                          )}
                          <p className="text-gray-500">Payment: {order.paymentMethod?.toUpperCase()}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">{order.status}</span>
                          <button onClick={() => handleUpdateOrderStatus(order._id, 'Preparing')} className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm">Preparing</button>
                          <button onClick={() => handleUpdateOrderStatus(order._id, 'Ready for Pickup')} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">Ready</button>
                          <button onClick={() => handleUpdateOrderStatus(order._id, 'Sent to Customer')} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Send to Customer</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg border border-gray-200 p-3 bg-white">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Status</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleUpdateDeliveryStatus(order._id, 'Pending')} className="px-3 py-2 rounded-lg bg-gray-600 text-white text-sm">Pending</button>
                            <button onClick={() => handleUpdateDeliveryStatus(order._id, 'Delivered')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm">Delivered</button>
                            <button onClick={() => handleUpdateDeliveryStatus(order._id, 'Not Accepted')} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm">Not Accepted</button>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3 bg-white">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Send Review to Customer</p>
                          <textarea
                            rows="3"
                            defaultValue={order.vendorReview || ''}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Write a quick review or update for this order..."
                            id={`review-${order._id}`}
                          />
                          <button
                            onClick={() => handleSendReview(order._id, document.getElementById(`review-${order._id}`).value)}
                            className="mt-2 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm"
                          >
                            Send Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="max-w-4xl animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Your Dishes</h1>
            
            {/* Add New Dish Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-bold mb-4">Add New Dish</h2>
              <form onSubmit={handleAddDish} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dish Name</label>
                  <input type="text" value={newDish.name} onChange={(e) => setNewDish({...newDish, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" placeholder="e.g. Rajma Chawal" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" value={newDish.price} onChange={(e) => setNewDish({...newDish, price: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" placeholder="150" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" value={newDish.category} onChange={(e) => setNewDish({...newDish, category: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" placeholder="e.g. Mains" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" value={newDish.description} onChange={(e) => setNewDish({...newDish, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" placeholder="Brief details about the dish..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                  <input type="url" value={newDish.image} onChange={(e) => setNewDish({...newDish, image: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" placeholder="https://example.com/dish.jpg" />
                </div>
                <div className="md:col-span-1">
                  <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors">
                    + Add Dish
                  </button>
                </div>
              </form>
            </div>

            {/* Current Menu List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 text-sm font-bold text-gray-700 flex justify-between">
                <span>Current Menu Items</span>
                <span>{menuItems.length} Dishes</span>
              </div>
              <div className="divide-y divide-gray-100">
                {menuItems.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 text-sm">No dishes added yet.</p>
                ) : (
                  menuItems.map((item) => (
                    <div key={item._id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">No image</div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">₹{item.price} • <span className="italic">{item.category || 'Uncategorized'}</span></p>
                          <p className="text-xs text-gray-500 mt-1 max-w-lg">{item.description}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteDish(item._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}