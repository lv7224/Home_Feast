import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/home";
import UserLogin from "./pages/userLogin";
import UserSignup from "./pages/userSignup";
import VendorSignup from "./pages/vendorSignup";
import AdminDashboard from "./pages/adminDashboard";
import Cookedit from "./pages/cook";
import KitchenMenuView from "./pages/KitchenMenuView";
import AdminLogin from "./pages/adminLogin";
import VendorLogin from "./pages/vendorLogin";
import Checkout from "./pages/Checkout";
import UserDashboard from "./pages/userDashboard";

function App() {
  const location = useLocation();
  const showFooter = location.pathname === "/";

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Main Marketplace View */}
          <Route path="/" element={<Home />} />

          {/* Login In Page */}
          <Route path="/userLogin" element={<UserLogin />} />

          {/* Signup In Page */}
          <Route path="/userSignup" element={<UserSignup />} />

          {/* Vendor Registration */}
          <Route path="/vendorSignup" element={<VendorSignup />} />

          {/* Vendor Login */}
          <Route path="/vendorLogin" element={<VendorLogin />} />

          {/* Admin Login */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Dashboard */}
          <Route path="/adminDashboard" element={<AdminDashboard />} />

          {/* Kitchen Menu View */}
          {/* <Route path="/kitechenView" element={<KitchenMenuView />} /> */}
          {/* Kitchen Menu View */}
          <Route path="/kitchen/:kitchenId" element={<KitchenMenuView />} />
          
          {/* Cooks menu View */}
          <Route path="/cook/:vendorId" element={<Cookedit />} />

          {/* Checkout Order */}
          <Route path="/checkout" element={<Checkout />} />

          {/* User Orders Dashboard */}
          <Route path="/userDashboard" element={<UserDashboard />} />
        </Routes>
        {showFooter && <Footer />}
      </main>
    </>
  );
}

export default App;