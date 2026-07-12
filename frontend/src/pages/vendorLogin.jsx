import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

const VendorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Connects to your backend proxy endpoint
      const response = await fetch('/api/vendor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const vendorSession = {
          _id: data.vendor?.id || data.vendor?._id,
          id: data.vendor?.id || data.vendor?._id,
          kitchenName: data.vendor?.kitchenName,
          chefName: data.vendor?.chefName,
          email: data.vendor?.email,
          serviceArea: data.vendor?.serviceArea,
        };
        localStorage.setItem('currentVendor', JSON.stringify(vendorSession));
        localStorage.setItem('vendor', JSON.stringify(vendorSession));
        window.dispatchEvent(new Event('authChange'));
        alert('Login successful!');
        navigate(`/cook/${vendorSession._id}`);
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
      }

     
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Backend Connection Error. Ensure your server is running.');
    }

  };

return (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans text-gray-800">

    {/* Main Content Card */}
    <main className="grow flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Vendor Portal
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Welcome back! Please enter your details to access your kitchen dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Email Address *
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="kitchen@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition duration-200 text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Password *
              </label>
              <a href="#" className="text-xs font-semibold text-[#e05638] hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition duration-200 text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#e05638] text-white font-bold py-3.5 px-4 rounded-lg shadow-md hover:bg-[#c9462a] active:scale-[0.99] transition-all duration-150 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider mt-4"
          >
            <LogIn size={18} />
            <span>Login to Dashboard</span>
          </button>
        </form>

        {/* Footer inside card */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            New to Home Feast?{' '}
            <a href="/vendorSignup" className="font-bold text-[#22c55e] hover:underline">
              Register Your Kitchen
            </a>
          </p>
        </div>
      </div>
    </main>

    {/* Footer */}
    <footer className="text-center py-4 bg-white border-t border-gray-100 text-xs text-gray-400">
      &copy; {new Date().getFullYear()} Home Feast. All rights reserved.
    </footer>
  </div>
);
};

export default VendorLogin;