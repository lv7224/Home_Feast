import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Auto-fill form values if user was just forwarded from a successful signup
  useEffect(() => {
    if (location.state && location.state.email) {
      setFormData({
        email: location.state.email,
        password: location.state.password || "",
      });
      setAlert({
        type: "success",
        message: "👋 Account details loaded successfully! Click 'Sign In' to enter.",
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    // Client-side validation
    if (!formData.email || !formData.password) {
      setAlert({
        type: "error",
        message: "⚠️ Error: Please fill in all fields before submitting.",
      });
      return;
    }

    try {
      // Send a POST request to your MongoDB-connected Express Backend API
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      // If the backend returned an error (e.g., status 400 or 500)
      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChange"));

      setAlert({
        type: "success",
        message: data.message || "🎉 Signed In Successfully! Redirecting to marketplace...",
      });

      setFormData({ email: "", password: "" });

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "❌ Connection failed. Ensure backend server is running.",
      });
    }
  };


  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 py-8 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to order fresh, homemade meals near you
          </p>
        </div>

        {alert.message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${alert.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
              }`}
          >
            {alert.message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              placeholder="name@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative flex items-center">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none select-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.644v-.002A11.001 11.001 0 0112 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <a
              href="#forgot"
              className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Forgot password?
            </a>
          </div>
                
          <button
            type="submit"
            className="w-full py-3 px-4 mt-4 rounded-lg shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/userSignup"
            className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;