import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function AdminDashboard() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("cooks"); // cooks, users, subscriptions, categories
  const [cooks, setCooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [cuisines, setCuisines] = useState([]); // Loaded dynamically from MongoDB now
  const [newCuisine, setNewCuisine] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin") || "null");
    if (!currentAdmin?.email) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  // --- REAL DATA FETCH FROM MONGODB VIA API ---
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Concurrently fetch all operational datasets from MongoDB collections
    Promise.all([
      fetch("/api/cooks").then((res) => { if (!res.ok) throw new Error("Cooks collection unreachable"); return res.json(); }),
      fetch("/api/users").then((res) => { if (!res.ok) throw new Error("Users collection unreachable"); return res.json(); }),
      fetch("/api/subscriptions").then((res) => { if (!res.ok) throw new Error("Subscriptions collection unreachable"); return res.json(); }),
      fetch("/api/cuisines").then((res) => { if (!res.ok) throw new Error("Cuisines collection unreachable"); return res.json(); })
    ])
      .then(([cooksData, usersData, subsData, cuisinesData]) => {
        setCooks(cooksData);
        setUsers(usersData);
        setSubscriptions(subsData);
        // Assumes your database returns an array of objects or strings e.g., [{ name: 'Punjabi' }] or ['Punjabi']
        setCuisines(Array.isArray(cuisinesData) ? cuisinesData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("MongoDB Data Sync Failure:", err);
        setError(err.message || "Failed to establish a live connection to your database.");
        setLoading(false);
      });
  }, []);

  // --- PERSISTENT HANDLER FUNCTIONS (WRITE TO MONGODB) ---
  
  const getCookStatus = (cook) =>
    cook.status || (cook.isVerified ? "Approved" : "Pending Approval");

  const handleApproveCook = (id) => {
    fetch(`/api/cooks/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Approved" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Database failed to update verification state.");
        return res.json();
      })
      .then(() => {
        setCooks(cooks.map(cook =>
          cook._id === id ? { ...cook, status: "Approved", isVerified: true } : cook
        ));
      })
      .catch((err) => alert(err.message));
  };

  const handleDeleteUser = async (id, name) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete user: ${name}? This action cannot be undone.`);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Database failed to delete the user record.");
      }

      setUsers((prevUsers) => prevUsers.filter((user) => (user._id || user.id) !== id));
      alert(data.message || "User deleted successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdjustCookRating = async (id, delta) => {
    try {
      const response = await fetch(`/api/kitchens/${id}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update kitchen rating.");
      }

      setCooks((prevCooks) => prevCooks.map((cook) =>
        cook._id === id ? { ...cook, rating: data.kitchen?.rating ?? cook.rating } : cook
      ));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddCuisine = (e) => {
    e.preventDefault();
    const cleanCuisine = newCuisine.trim();
    if (!cleanCuisine) return;

    // Check if it already exists locally to save a redundant network call
    if (cuisines.some(c => (typeof c === 'string' ? c : c.name).toLowerCase() === cleanCuisine.toLowerCase())) {
      alert("This cuisine option already exists in your platform catalog.");
      return;
    }

    fetch("/api/cuisines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanCuisine }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to insert new cuisine layout into MongoDB.");
        return res.json();
      })
      .then((savedCuisine) => {
        // Use backend returned object structural wrapper if your schema requires it
        setCuisines([...cuisines, savedCuisine]);
        setNewCuisine("");
      })
      .catch((err) => alert(err.message));
  };

  const handleRemoveCuisine = (idOrName) => {
    fetch(`/api/cuisines/${idOrName}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to purge requested category from MongoDB document storage.");
        return res.json();
      })
      .then(() => {
        setCuisines(cuisines.filter(c => (c._id || c) !== idOrName));
      })
      .catch((err) => alert(err.message));
  };

  if (loading) return <div className="text-center p-10 font-medium text-gray-500">Connecting to database architecture...</div>;
  
  if (error) return (
    <div className="p-8 max-w-xl mx-auto text-center mt-12 bg-red-50 border border-red-200 rounded-xl">
      <span className="text-3xl">📡</span>
      <h2 className="text-md font-bold text-red-800 mt-3">Live Database Synchronizer Crash</h2>
      <p className="text-xs text-red-600 mt-1">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition">Retry Connection</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR NAVIGATION CONTROLS */}
      <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800">
        <div className="p-5 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">HF</div>
          <span className="text-lg font-bold tracking-wider text-white">ADMIN PORTAL</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("cooks")}
            className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "cooks" ? "bg-green-600 text-white" : "hover:bg-gray-800 text-gray-400 hover:text-white"}`}
          >
            🍳 Cook Registrations
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "users" ? "bg-green-600 text-white" : "hover:bg-gray-800 text-gray-400 hover:text-white"}`}
          >
            👥 Manage Users
          </button>
          <button 
            onClick={() => setActiveTab("subscriptions")}
            className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "subscriptions" ? "bg-green-600 text-white" : "hover:bg-gray-800 text-gray-400 hover:text-white"}`}
          >
            📋 Monitor Subscriptions
          </button>
          <button 
            onClick={() => setActiveTab("categories")}
            className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "categories" ? "bg-green-600 text-white" : "hover:bg-gray-800 text-gray-400 hover:text-white"}`}
          >
            🌶️ Cuisines & Categories
          </button>
        </nav>
      </aside>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace("-", " ")} Management</h1>
          <div className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium">Role: Primary Administrator</div>
        </header>

        {/* TAB 1: MANAGE COOKS & APPROVALS */}
        {activeTab === "cooks" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Kitchen / Chef</th>
                  <th className="p-4">Service Area</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">Vendor Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {cooks.map(cook => {
                  const status = getCookStatus(cook);
                  return (
                  <tr key={cook._id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{cook.kitchenName}</div>
                      <div className="text-xs text-gray-400">{cook.chefName}</div>
                    </td>
                    <td className="p-4 text-gray-500">📍 {cook.serviceArea}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status === "Approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-yellow-600">★ {Number(cook.rating || 0).toFixed(1)}</span>
                        <button onClick={() => handleAdjustCookRating(cook._id, 0.5)} className="text-xs font-semibold text-green-600 hover:text-green-700">+0.5</button>
                        <button onClick={() => handleAdjustCookRating(cook._id, -0.5)} className="text-xs font-semibold text-red-600 hover:text-red-700">-0.5</button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {status === "Pending Approval" && (
                        <button 
                          onClick={() => handleApproveCook(cook._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Approve Onboarding
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: MANAGE USERS */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email Credentials</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {users.filter(user => user && user.name && user.email).map(user => (
                  <tr key={user._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-semibold text-gray-800">{user.name}</td>
                    <td className="p-4 text-gray-500">{user.email}</td>
                    <td className="p-4 text-gray-400">{(user.createdAt || user.joinedDate) ? new Date(user.createdAt || user.joinedDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: MONITOR ORDERS & SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Subscriber</th>
                  <th className="p-4">Target Kitchen</th>
                  <th className="p-4">Plan Structural Tier</th>
                  <th className="p-4">Price Charged</th>
                  <th className="p-4">Tracking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {subscriptions.map(sub => (
                  <tr key={sub._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-semibold text-gray-800">{sub.userName}</td>
                    <td className="p-4 text-gray-600">{sub.kitchenName}</td>
                    <td className="p-4 text-gray-500">{sub.planType} Plan</td>
                    <td className="p-4 font-bold text-gray-900">₹{sub.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${sub.status === "Active" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: CATEGORIES AND CUISINES MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add Supported Global Cuisine</h3>
              <form onSubmit={handleAddCuisine} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Bengali, Rajasthani"
                  value={newCuisine}
                  onChange={(e) => setNewCuisine(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-green-500"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-700 transition">
                  Append Cuisine
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Currently Permitted Platform Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {cuisines.map(cuisine => {
                  const label = typeof cuisine === 'string' ? cuisine : cuisine.name;
                  const keyId = cuisine._id || label;
                  return (
                    <span key={keyId} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                      {label}
                      <button 
                        onClick={() => handleRemoveCuisine(keyId)} 
                        className="text-gray-400 hover:text-red-500 font-bold ml-1 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
