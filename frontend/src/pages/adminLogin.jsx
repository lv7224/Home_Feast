import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_CREDENTIALS = {
  email: 'admin@homefeast.com',
  password: 'admin123',
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin') || 'null');
    if (currentAdmin?.email) {
      navigate('/adminDashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (
        email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        localStorage.setItem('currentAdmin', JSON.stringify({
          email: ADMIN_CREDENTIALS.email,
          name: 'Administrator',
        }));
        window.dispatchEvent(new Event('authChange'));
        navigate('/adminDashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_35%),linear-gradient(135deg,#fff7ed_0%,#f8fafc_100%)] px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.28)]">
        
        {/* Header */}
        <div className="bg-linear-to-r from-orange-600 to-amber-500 px-6 py-8 text-center text-white sm:px-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l7.5 4.5v7.5L12 20.25 4.5 15.75V8.25L12 3.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your platform
          </p>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
            <p>{error}</p>
          </div>
        )}

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
          <p className="font-semibold">Demo admin credentials</p>
          <p>Admin ID: <span className="font-medium">{ADMIN_CREDENTIALS.email}</span></p>
          <p>Password: <span className="font-medium">{ADMIN_CREDENTIALS.password}</span></p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="admin@homefeast.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
                  placeholder="••••••••"
                />
                {/* Toggle Visibility */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me / Forgot Password Placeholder */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
          </div>
        </form>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;                                                      