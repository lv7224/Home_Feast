import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const loadSession = () => {
  const storedUser = localStorage.getItem("currentUser");
  const storedVendor = localStorage.getItem("currentVendor") || localStorage.getItem("vendor");
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    vendor: storedVendor ? JSON.parse(storedVendor) : null,
  };
};

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      const session = loadSession();
      setUser(session.user);
      setVendor(session.vendor);
    };

    syncSession();
    window.addEventListener("authChange", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("authChange", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const handleUserLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setShowUserDropdown(false);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const handleVendorLogout = () => {
    localStorage.removeItem("currentVendor");
    localStorage.removeItem("vendor");
    setVendor(null);
    setShowVendorDropdown(false);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  return (
    <nav className="bg-gray-100 border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4 relative z-50">
      {/* Logo Section */}
      <div className="ml-20">
        <a href="/" className="flex items-center">
          <img src="/logo.svg" alt="Home Feast Logo" className="w-15 h-15 object-contain" />
          <h1 className="text-4xl font-bold text-green-500 ml-5">HOME FEAST</h1>
        </a>
      </div>
      {/* Search Bar Section */}
      {/* Unified Search Bar & Service Filter Container
      <form 
        onSubmit={handleSearch}
        className="flex flex-1 max-w-2xl w-full items-center border border-green-500 rounded-lg overflow-hidden bg-white shadow-sm"
      >
        <input
          type="text"
          className="w-2/5 h-10 px-4 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none border-r border-gray-200"
          placeholder="📍 Area or location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="w-2/5 h-10 relative flex items-center bg-transparent">
          <select
            className="w-full h-full pl-3 pr-8 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none cursor-pointer appearance-none"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="" disabled hidden>🔍 Select Services...</option>
            <option value="all">All Services</option>
            <option value="catering">Catering Service</option>
            <option value="tiffin">Tiffin Services</option>
            <option value="chef">Home Chefs</option>
          </select>
          <div className="absolute right-3 pointer-events-none text-xs">▼</div>
        </div>

        <button 
          type="submit"
          className="w-1/5 h-10 bg-green-500 hover:bg-green-600 text-white font-medium transition-colors text-sm flex items-center justify-center"
        >
          Search
        </button>
      </form> */}

      {/* Navigation Links / Profile Corner */}
      <div className="flex items-center mr-20">
        <ul className="flex items-center space-x-6 font-medium">
          {user ? (
            <li className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowVendorDropdown(false);
                }}
                className="flex items-center gap-2 focus:outline-none bg-white py-1.5 px-3 border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 bg-green-500 text-white font-bold text-xs rounded-full flex items-center justify-center uppercase shadow-inner">
                  {user.name ? user.name.substring(0, 2) : "US"}
                </div>
                <div className="text-gray-700 text-sm hidden sm:inline max-w-30 truncate">
                  Hi, {user.name || "User"}
                </div>
                <div className="text-gray-400 text-[10px] ml-0.5">▼</div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">User Account</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <a
                    href="/userDashboard"
                    className="block px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium transition-colors"
                  >
                    My Orders
                  </a>
                  <button
                    onClick={handleUserLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2 mt-1"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <a href="/userLogin" className="text-orange-500 hover:text-orange-700 transition-colors py-1 px-2 rounded">
                User Login
              </a>
            </li>
          )}
          {vendor ? (
            <li className="relative">
              <button
                onClick={() => {
                  setShowVendorDropdown(!showVendorDropdown);
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 focus:outline-none bg-white py-1.5 px-3 border border-fuchsia-200 rounded-full shadow-sm hover:bg-fuchsia-50 transition-colors"
              >
                <div className="w-7 h-7 bg-fuchsia-500 text-white font-bold text-xs rounded-full flex items-center justify-center uppercase shadow-inner">
                  {vendor.kitchenName ? vendor.kitchenName.substring(0, 2) : "VK"}
                </div>
                <div className="text-gray-700 text-sm hidden sm:inline max-w-32 truncate">
                  {vendor.kitchenName || "My Kitchen"}
                </div>
                <div className="text-gray-400 text-[10px] ml-0.5">▼</div>
              </button>

              {showVendorDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-fuchsia-500 uppercase tracking-wider">Vendor Kitchen</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{vendor.kitchenName}</p>
                    {vendor.chefName && (
                      <p className="text-xs text-gray-600 truncate">Chef: {vendor.chefName}</p>
                    )}
                    <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
                    {vendor.serviceArea && (
                      <p className="text-xs text-gray-500 truncate">📍 {vendor.serviceArea}</p>
                    )}
                  </div>
                  <a
                    href={`/cook/${vendor._id || vendor.id}`}
                    className="block px-4 py-2 text-sm text-fuchsia-600 hover:bg-fuchsia-50 font-medium transition-colors"
                  >
                    My Kitchen Portal
                  </a>
                  <button
                    onClick={handleVendorLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <a href="/vendorSignup" className="text-fuchsia-500 hover:text-fuchsia-700 transition-colors py-1 px-2 rounded">
                Vendor Signup
              </a>
            </li>
          )}
          <li>
            <a href="/admin" className="text-purple-500 hover:text-purple-700 transition-colors py-1 px-2 rounded">
              Admin Login
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
};

export default Navbar;