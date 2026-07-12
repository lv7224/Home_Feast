import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VendorSignup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    kitchenName: "",
    chefName: "",
    email: "",
    phone: "",
    serviceArea: "",
    password: "",
    confirmPassword: "",
    mealTypePreference: "Veg", // Default choice
    cuisineTypes: "", // Inputted as comma-separated string
    dailyPrice: "",
    weeklyPrice: "",
    monthlyPrice: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic Validation Checklist
    if (!formData.kitchenName || !formData.email || !formData.serviceArea || !formData.password || !formData.confirmPassword) {
      setError("❌ Please fill out all required foundational fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("🔒 Error: Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("🔒 Error: Password must be at least 6 characters long.");
      return;
    }

    // Convert comma-separated string of cuisines into a clean array
    const cleanCuisines = formData.cuisineTypes
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const { dailyPrice, weeklyPrice, monthlyPrice, cuisineTypes, confirmPassword, ...vendorFields } = formData;
    const payload = {
      ...vendorFields,
      cuisineTypes: cleanCuisines,
      pricingPlans: {
        daily: Number(dailyPrice) || 0,
        weekly: Number(weeklyPrice) || 0,
        monthly: Number(monthlyPrice) || 0,
      },
    };

    try {
      const response = await fetch("/api/vendors/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during registration.");
      }

      setSuccess("🎉 Your HomeFeast kitchen application has been submitted for verification!");

      const vendorSession = {
        _id: data.vendor._id,
        kitchenName: data.vendor.kitchenName,
        chefName: data.vendor.chefName,
        email: data.vendor.email,
        serviceArea: data.vendor.serviceArea,
        status: data.vendor.status,
      };
      localStorage.setItem("currentVendor", JSON.stringify(vendorSession));
      window.dispatchEvent(new Event("authChange"));

      // Clear out the form inputs
      setFormData({
        kitchenName: "",
        chefName: "",
        email: "",
        phone: "",
        serviceArea: "",
        password: "",
        confirmPassword: "",
        mealTypePreference: "Veg",
        cuisineTypes: "",
        dailyPrice: "",
        weeklyPrice: "",
        monthlyPrice: "",
      });

      // Redirect to the vendor login page after a brief delay
      setTimeout(() => navigate("/vendorLogin"), 1500);
    } catch (err) {
      setError(err.message || "Failed to connect to server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100">
        
        {/* Form Title Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Register Your Home Kitchen/ Tiffin Service
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join <span className="text-green-600 font-semibold">HomeFeast</span> to serve healthy, home-style meals to local subscribers.
          </p>
        </div>

        {/* Alert Notifications */}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md font-medium border border-red-200">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md font-medium border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Core Kitchen Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-4">1. Kitchen Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kitchen Name *</label>
                <input
                  type="text"
                  name="kitchenName"
                  placeholder="e.g. Mom's Punjabi Kitchen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                  value={formData.kitchenName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chef Full Name</label>
                <input
                  type="text"
                  name="chefName"
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                  value={formData.chefName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact and Security Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="kitchen@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="10-digit number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Hub / Area *</label>
              <input
                type="text"
                name="serviceArea"
                placeholder="e.g. Sector 62, Noida"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                value={formData.serviceArea}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Secure Credentials Subdivision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative flex items-center">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none select-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644v-.002A11.001 11.001 0 0112 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative flex items-center">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none select-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644v-.002A11.001 11.001 0 0112 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Meal Class and Cuisines Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-4">2. Menu & Categorization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type Preference</label>
                <select
                  name="mealTypePreference"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                  value={formData.mealTypePreference}
                  onChange={handleChange}
                >
                  <option value="Veg">Pure Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian Only</option>
                  <option value="Both">Veg & Non-Veg</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Specialities (Comma Separated)</label>
                <input
                  type="text"
                  name="cuisineTypes"
                  placeholder="Punjabi, South Indian, Healthy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                  value={formData.cuisineTypes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Subscription Rate Card Layout */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-4">3. Subscription Rate Cards (INR)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Plan Price</label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    name="dailyPrice"
                    placeholder="e.g. 120"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                    value={formData.dailyPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Plan Price</label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    name="weeklyPrice"
                    placeholder="e.g. 800"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                    value={formData.weeklyPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Plan Price</label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    name="monthlyPrice"
                    placeholder="e.g. 3200"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white text-gray-900"
                    value={formData.monthlyPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer"
            >
              Onboard Kitchen Portal
            </button>
          </div>
        </form>

        {/* Existing Account Navigation Redirect Link */}
        <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">
          Already registered?{" "}
          <span 
            onClick={() => navigate("/vendorLogin")} 
            className="font-medium text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            Sign In to Dashboard
          </span>
        </p>

      </div>
    </div>
  );
}