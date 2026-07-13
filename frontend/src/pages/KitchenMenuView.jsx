import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function KitchenMenuView() {
  // Extract the live MongoDB identifier directly from the browser URL parameter
  const { kitchenId } = useParams();

  const [kitchen, setKitchen] = useState(null);
  const [menuCategories, setMenuCategories] = useState({});
  const [cart, setCart] = useState({}); // Stores { itemId: quantity }
  const [menuItemsMap, setMenuItemsMap] = useState({}); // Lookup map to get full item details in cart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [isRatingUpdating, setIsRatingUpdating] = useState(false);
  const [hasRatedKitchen, setHasRatedKitchen] = useState(false);

  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentUser') || 'null') : null;
  const currentAdmin = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentAdmin') || 'null') : null;
  const canModifyRating = Boolean(currentUser?.email || currentAdmin?.email);

  useEffect(() => {
    const savedCart = localStorage.getItem('homefeastCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          const restoredCart = parsedCart.reduce((acc, item) => {
            if (item?.id && Number(item.qty) > 0) {
              acc[item.id] = Number(item.qty);
            }
            return acc;
          }, {});
          setCart(restoredCart);
        }
      } catch (error) {
        console.error('Could not restore cart from storage', error);
      }
    }
  }, []);

  useEffect(() => {
    const storedRatings = JSON.parse(localStorage.getItem('homefeastRatedKitchens') || '{}');
    setHasRatedKitchen(Boolean(kitchenId && storedRatings[kitchenId]));
  }, [kitchenId]);

  useEffect(() => {
    const fetchKitchenAndMenu = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Fetch kitchen details directly using the dynamic MongoDB Document ID
        const kitchenResponse = await fetch(`http://localhost:5000/api/kitchens/${kitchenId}`);
        if (!kitchenResponse.ok) {
          throw new Error("Failed to fetch kitchen details from database.");
        }
        const kitchenData = await kitchenResponse.json();

        // 2. Fetch menu items matching this kitchen's foreign key identifier 
        const menuResponse = await fetch(`http://localhost:5000/api/menu?kitchenId=${kitchenId}`);
        if (!menuResponse.ok) {
          throw new Error("Failed to fetch menu items from database.");
        }
        const menuItems = await menuResponse.json();

        // Create a flat map of items so we can look up names/prices in the cart easily
        const itemsMap = {};
        menuItems.forEach(item => {
          itemsMap[item._id] = item;
        });
        setMenuItemsMap(itemsMap);

        // 3. Perform client-side grouping on the MongoDB array collection
        const grouped = menuItems.reduce((acc, item) => {
          const categoryName = item.category || "General";
          if (!acc[categoryName]) acc[categoryName] = [];
          acc[categoryName].push(item);
          return acc;
        }, {});

        setKitchen(kitchenData);
        setMenuCategories(grouped);

        localStorage.setItem('homefeastCheckoutContext', JSON.stringify({
          kitchenId,
          kitchenName: kitchenData.kitchenName || kitchenData.name || 'Kitchen',
          serviceArea: kitchenData.location || kitchenData.serviceArea || 'Location not provided',
        }));
      } catch (err) {
        console.error("Database connection error:", err);
        setError(err.message || "Error reading data from MongoDB.");
      } finally {
        setLoading(false);
      }
    };

    if (kitchenId) {
      fetchKitchenAndMenu();
    }
  }, [kitchenId]);

  useEffect(() => {
    const itemsToSave = Object.entries(cart).map(([itemId, qty]) => {
      const item = menuItemsMap[itemId];
      return item ? { id: itemId, name: item.name, price: Number(item.price) || 0, qty } : null;
    }).filter(Boolean);

    if (itemsToSave.length > 0) {
      localStorage.setItem('homefeastCart', JSON.stringify(itemsToSave));
    } else {
      localStorage.removeItem('homefeastCart');
    }
  }, [cart, menuItemsMap]);

  const handleUpdateCart = (itemId, quantity) => {
    setCart(prev => {
      const updated = { ...prev };
      if (quantity <= 0) delete updated[itemId];
      else updated[itemId] = quantity;
      return updated;
    });
  };

  // Calculate cart subtotal dynamically
  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = menuItemsMap[itemId];
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleRatingChange = async (delta) => {
    if (!kitchenId || hasRatedKitchen) return;

    if (!canModifyRating) {
      setRatingMessage("Please log in as a user or admin to rate this kitchen.");
      return;
    }

    setIsRatingUpdating(true);
    setRatingMessage("");

    try {
      const response = await fetch(`/api/kitchens/${kitchenId}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update rating.");
      }

      const storedRatings = JSON.parse(localStorage.getItem('homefeastRatedKitchens') || '{}');
      storedRatings[kitchenId] = true;
      localStorage.setItem('homefeastRatedKitchens', JSON.stringify(storedRatings));

      setKitchen((prev) => prev ? { ...prev, rating: data.kitchen?.rating ?? prev.rating } : prev);
      setHasRatedKitchen(true);
      setRatingMessage(delta > 0 ? "Thanks! Rating increased." : "Rating decreased.");
    } catch (err) {
      setRatingMessage(err.message || "Unable to update rating.");
    } finally {
      setIsRatingUpdating(false);
    }
  };

  if (loading) return <div className="text-center p-10 font-medium text-gray-600">Loading Feast Menu...</div>;
  if (error) return <div className="text-center p-10 text-red-600 font-medium">⚠️ {error}</div>;
  if (!kitchen) return <div className="text-center p-10 text-gray-500">Kitchen profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Banner */}
      <div className="relative h-64 bg-gray-900">
        <img 
          src={kitchen.bannerImage && /^https?:\/\//i.test(kitchen.bannerImage) ? kitchen.bannerImage : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"} 
          alt={kitchen.name || "Kitchen Banner"} 
          className="w-full h-full object-cover opacity-60" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white max-w-4xl">
          <span className={`text-xs font-bold px-2.5 py-1 rounded ${
            kitchen.preference === 'Non-Veg' ? 'bg-red-600' :
            kitchen.preference === 'Both' ? 'bg-blue-600' :
            'bg-green-600'
          }`}>
            ● {kitchen.preference || "Veg"}
          </span>
          <h1 className="text-3xl font-bold mt-2 text-white">
            {kitchen.name || "Default Kitchen Name"}
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            {kitchen.description || ""}
          </p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex gap-4 text-sm items-center flex-wrap">
          <span className="font-bold text-yellow-500">★ {Number(kitchen.rating || 0).toFixed(1)}</span>
          {!hasRatedKitchen && (
            canModifyRating ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRatingChange(0.5)}
                  disabled={isRatingUpdating}
                  className="rounded-full border border-green-500 px-2.5 py-1 text-xs font-semibold text-green-600 hover:bg-green-50 disabled:opacity-50"
                >
                  +0.5
                </button>
                <button
                  onClick={() => handleRatingChange(-0.5)}
                  disabled={isRatingUpdating}
                  className="rounded-full border border-red-500 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  -0.5
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-500">Login to rate this kitchen</span>
            )
          )}
          <span className="text-gray-600">📍 {kitchen.location || "Location not provided"}</span>
        </div>
        <div className="flex gap-2">
          {kitchen.cuisines && kitchen.cuisines.length > 0 ? (
            kitchen.cuisines.map((c, i) => (
              <span key={i} className="bg-gray-100 text-xs px-3 py-1 rounded-full text-gray-700">{c}</span>
            ))
          ) : (
            <span className="bg-gray-100 text-xs px-3 py-1 rounded-full text-gray-400">Home Style</span>
          )}
        </div>
      </div>

      {ratingMessage && (
        <div className="mx-6 mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          {ratingMessage}
        </div>
      )}

      {/* Content Columns */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Listings */}
        <div className="lg:col-span-2 space-y-8">
          {Object.keys(menuCategories).length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 text-gray-500">
              No menu items listed under this kitchen portal yet.
            </div>
          ) : (
            Object.entries(menuCategories).map(([categoryName, items]) => (
              <div key={categoryName} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold border-b pb-3 mb-4 text-gray-900">{categoryName}</h3>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const qty = cart[item._id] || 0;
                    return (
                      <div key={item._id} className="py-4 flex justify-between items-start gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                          ) : null}
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm font-bold text-gray-800 mt-0.5">₹{item.price}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="min-w-25">
                          {qty > 0 ? (
                            <div className="flex items-center justify-between w-full bg-orange-500 text-white rounded-lg font-bold">
                              <button onClick={() => handleUpdateCart(item._id, qty - 1)} className="px-3 py-1 cursor-pointer">-</button>
                              <span className="text-sm">{qty}</span>
                              <button onClick={() => handleUpdateCart(item._id, qty + 1)} className="px-3 py-1 cursor-pointer">+</button>
                            </div>
                          ) : (
                            <button onClick={() => handleUpdateCart(item._id, 1)} className="w-full border border-orange-500 text-orange-500 font-bold py-1 px-4 rounded-lg text-sm hover:bg-orange-50 cursor-pointer transition-colors">
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Basket/Cart Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold border-b pb-3 mb-4 text-gray-900">Basket</h3>
            
            {Object.keys(cart).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Your basket is empty.</p>
            ) : (
              <>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-1">
                  {Object.entries(cart).map(([itemId, qty]) => {
                    const item = menuItemsMap[itemId];
                    if (!item) return null;
                    return (
                      <div key={itemId} className="flex justify-between items-center text-sm">
                        <div className="flex-1 truncate pr-2">
                          <span className="font-semibold text-gray-800">{item.name}</span>
                          <span className="text-xs text-gray-400 block">₹{item.price} x {qty}</span>
                        </div>
                        <span className="font-bold text-gray-900">₹{item.price * qty}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Total Billing */}
                <div className="border-t pt-3 flex justify-between items-center font-bold text-gray-900">
                  <span>Subtotal:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                  <a href="/checkout">
                <button className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl mt-4 shadow hover:bg-orange-600 transition-colors cursor-pointer">
                  Proceed to Checkout
                </button>
                  </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}