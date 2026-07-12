import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewStatus, setReviewStatus] = useState({});

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser?.email) {
      navigate('/userLogin');
      return;
    }

    setUser(currentUser);

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userEmail=${encodeURIComponent(currentUser.email)}`);
        if (!res.ok) throw new Error('Failed to fetch your orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleReviewChange = (orderId, value) => {
    setReviewDrafts((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleSendReview = async (orderId) => {
    const reviewText = (reviewDrafts[orderId] || "").trim();
    if (!reviewText) {
      setReviewStatus((prev) => ({ ...prev, [orderId]: 'Please enter a review before sending.' }));
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorReview: reviewText }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send review.');
      }

      const updated = await res.json();
      setOrders((prevOrders) => prevOrders.map((order) => (order._id === orderId ? updated.order : order)));
      setReviewStatus((prev) => ({ ...prev, [orderId]: 'Review submitted successfully.' }));
      setReviewDrafts((prev) => ({ ...prev, [orderId]: '' }));
    } catch (err) {
      setReviewStatus((prev) => ({ ...prev, [orderId]: err.message }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track delivery status, review your kitchen, and review your order history.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <p className="text-gray-500">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">You have not placed any orders yet.</p>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex flex-col md:flex-row md:justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">{order.vendorName || 'Kitchen'}</h2>
                      <p className="text-sm text-gray-600">Ordered on {new Date(order.createdAt).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Delivery: {order.deliveryOption === 'selfPickup' ? 'Self Pickup' : 'Home Delivery'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">Total ₹{order.totalAmount}</p>
                      <p className="text-sm text-orange-600">Status: {order.status}</p>
                      <p className="text-sm text-green-600">Delivery: {order.deliveryStatus || 'Pending'}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items</p>
                    {order.cartItems?.map((item, idx) => (
                      <div key={`${order._id}-${idx}`} className="flex justify-between text-sm text-gray-600">
                        <span>{item.qty}x {item.name}</span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {order.deliveryStatus === 'Delivered' && !order.vendorReview && (
                    <div className="mt-4 border-t pt-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Share a review for this kitchen</p>
                      <textarea
                        className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        value={reviewDrafts[order._id] || ''}
                        onChange={(e) => handleReviewChange(order._id, e.target.value)}
                        placeholder="Write a quick review for the kitchen..."
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <button
                          onClick={() => handleSendReview(order._id)}
                          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                        >
                          Send Review
                        </button>
                        {reviewStatus[order._id] && (
                          <p className="text-sm text-gray-600">{reviewStatus[order._id]}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.vendorReview && (
                    <div className="mt-4 border-t pt-3">
                      <p className="text-sm font-semibold text-gray-700">Kitchen Review</p>
                      <p className="text-sm text-gray-600">{order.vendorReview}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
