import React, { useState, useEffect, useRef } from "react";
import KitchenMenuView from "../pages/KitchenMenuView";

export default function CookDirectory() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Track network/API errors

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedMealType, setSelectedMealType] = useState("All"); // 'All', 'Veg', 'Non-Veg'
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState("All"); // 'All', 250, 500, 1000

  // UI Dropdown Open/Close states
  const [activeDropdown, setActiveDropdown] = useState(null); // 'area', 'cuisine', 'dietary', 'rating', 'price'
  const dropdownRef = useRef(null);

  // Dynamic filter lists parsed out from database entries
  const [availableAreas, setAvailableAreas] = useState([]);
  const [availableCuisines, setAvailableCuisines] = useState([]);

  // Fetch verified cooks from backend API
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/cooks?approved=true")
      .then((res) => {
        // Fix: Explicitly intercept bad gateway/server crashes before parsing JSON
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status} (Bad Gateway)`);
        }
        return res.json();
      })
      .then((data) => {
        setCooks(data);
        const areas = ["All", ...new Set(data.map((c) => c.serviceArea).filter(Boolean))];
        const cuisines = ["All", ...new Set(data.flatMap((c) => c.cuisineTypes).filter(Boolean))];
        setAvailableAreas(areas);
        setAvailableCuisines(cuisines);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cooks:", err);
        setError(err.message || "Failed to load cooks from server.");
        setLoading(false);
      });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (type) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  // Filter Pipeline Logic
  const filteredCooks = cooks.filter((cook) => {
    const matchesSearch =
      cook.kitchenName.toLowerCase().includes(search.toLowerCase()) ||
      cook.cuisineTypes.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
      cook.serviceArea.toLowerCase().includes(search.toLowerCase());

    const matchesArea = selectedArea === "All" || cook.serviceArea === selectedArea;
    const matchesCuisine = selectedCuisine === "All" || cook.cuisineTypes.includes(selectedCuisine);
    const matchesMealType =
      selectedMealType === "All" ||
      cook.mealTypePreference === selectedMealType ||
      (selectedMealType === "Veg" && cook.mealTypePreference === "Both") ||
      (selectedMealType === "Non-Veg" && cook.mealTypePreference === "Both");
    const matchesRating = (cook.rating || 0) >= minRating;

    // Price Filter matching mechanism (fallback value of 150 if field is empty in DB)
    const matchesPrice = maxPrice === "All" || (cook.approxPricePerPlate || 150) <= maxPrice;

    return matchesSearch && matchesArea && matchesCuisine && matchesMealType && matchesRating && matchesPrice;
  });

  const clearAllFilters = () => {
    setSearch("");
    setSelectedArea("All");
    setSelectedCuisine("All");
    setSelectedMealType("All");
    setMinRating(0);
    setMaxPrice("All");
    setActiveDropdown(null);
  };

  const hasActiveFilters = selectedArea !== "All" || selectedCuisine !== "All" || selectedMealType !== "All" || minRating !== 0 || maxPrice !== "All" || search !== "";

  return (
    <div className="w-full max-w-7xl mx-auto px-0 py-2 bg-gray-50/50 min-h-screen sm:px-1 sm:py-4 lg:px-2 lg:py-6">

      {/* HEADER SECTION */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Top Homemade Catering & Meal Services</h1>
        <p className="mt-1 text-sm leading-6 text-gray-500 sm:text-base">Discover verified local home kitchens serving fresh, personalized meals near you.</p>
      </div>

      {/* FILTER STACK CONTAINER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm mb-8 space-y-4" ref={dropdownRef}>

        {/* 1. Sleek Modern Search Bar */}
        <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
          <span className="pl-4 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search kitchens, neighborhoods, or specific cuisines..."
            className="w-full pl-3 pr-4 py-3 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mr-3  px-3 py-1 bg-gray-200/60 hover:bg-gray-300 rounded-lg text-xs font-semibold text-gray-600 transition-colors"
            >
              Clear All
            </button>
          )}

          {/* add button here for search  */}

        </div>

        {/* 2. Horizontal Interactive Filter Pills */}
        <div className="grid grid-cols-1 gap-2 border-t border-gray-100 pt-2 sm:grid-cols-2 xl:grid-cols-4">

          {/* Areas Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("area")}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${selectedArea !== "All"
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              📍 Area: <span className="font-bold">{selectedArea}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            {activeDropdown === "area" && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                {availableAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => { setSelectedArea(area); setActiveDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex justify-between items-center ${selectedArea === area ? "text-green-600 font-bold bg-green-50/40" : "text-gray-700"}`}
                  >
                    {area} {selectedArea === area && "✓"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cuisines Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("cuisine")}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${selectedCuisine !== "All"
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              🍳 Cuisine: <span className="font-bold">{selectedCuisine}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            {activeDropdown === "cuisine" && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                {availableCuisines.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => { setSelectedCuisine(cuisine); setActiveDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex justify-between items-center ${selectedCuisine === cuisine ? "text-green-600 font-bold bg-green-50/40" : "text-gray-700"}`}
                  >
                    {cuisine} {selectedCuisine === cuisine && "✓"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dietary Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("dietary")}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${selectedMealType !== "All"
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              🥗 Preference: <span className="font-bold">{selectedMealType}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            {activeDropdown === "dietary" && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {["All", "Veg", "Non-Veg", "Both"].map((type) => (
                  <button
                    key={type}
                    onClick={() => { setSelectedMealType(type); setActiveDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex justify-between items-center ${selectedMealType === type ? "text-green-600 font-bold bg-green-50/40" : "text-gray-700"}`}
                  >
                    {type === "All" ? "Show Everything" : type === "Both" ? "Veg & Non-Veg" : type} {selectedMealType === type && "✓"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("price")}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${maxPrice !== "All"
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              💰 Price: <span className="font-bold">{maxPrice === "All" ? "Any Price" : `Under ₹${maxPrice}`}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            {activeDropdown === "price" && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {[
                  { label: "Any Price", value: "All" },
                  { label: "Under ₹250 / plate", value: 250 },
                  { label: "Under ₹500 / plate", value: 500 },
                  { label: "Under ₹1000 / plate", value: 1000 }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => { setMaxPrice(item.value); setActiveDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex justify-between items-center ${maxPrice === item.value ? "text-green-600 font-bold bg-green-50/40" : "text-gray-700"}`}
                  >
                    {item.label} {maxPrice === item.value && "✓"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ratings Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("rating")}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${minRating !== 0
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              ⭐ Rating: <span className="font-bold">{minRating === 0 ? "Any" : `★ ${minRating}+`}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            {activeDropdown === "rating" && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {[
                  { label: "Any Rating", value: 0 },
                  { label: "★ 4.5 & above", value: 4.5 },
                  { label: "★ 4.0 & above", value: 4.0 },
                  { label: "★ 3.5 & above", value: 3.5 }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => { setMinRating(item.value); setActiveDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex justify-between items-center ${minRating === item.value ? "text-green-600 font-bold bg-green-50/40" : "text-gray-700"}`}
                  >
                    {item.label} {minRating === item.value && "✓"}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RESULTS DISPLAY GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Curating standard marketplace kitchens...</p>
        </div>
      ) : error ? (
        /* Error Layout State */
        <div className="text-center py-16 bg-red-50 border border-red-200 rounded-2xl max-w-xl mx-auto p-6">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-md font-bold text-red-800 mt-4">Backend Connection Error</h3>
          <p className="text-xs text-red-600 mt-1 max-w-xs mx-auto">{error}</p>
          <p className="text-[11px] text-gray-500 mt-4 bg-white/80 p-2 rounded border border-red-100">
            Ensure your backend server is running and your <code className="bg-gray-100 px-1 py-0.5 rounded text-red-700">vite.config.js</code> proxy target matches your backend port.
          </p>
        </div>
      ) : filteredCooks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-xl mx-auto p-6">
          <span className="text-4xl">🍽️</span>
          <h3 className="text-md font-bold text-gray-800 mt-4">No matching kitchens found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">We couldn't find any home kitchens that matched your active filters. Try adjustments or clear selections.</p>
          <button onClick={clearAllFilters} className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition-colors">Reset Filters</button>
        </div>
      ) : (
        <div>
          <div className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Showing {filteredCooks.length} Local Kitchens</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCooks.map((cook) => {
              const kitchenImage = cook.bannerImage || cook.image || cook.imageUrl || cook.profileImage;
              return (
              <div
                key={cook._id}
                className="group bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Banner Container */}
                  <div className="h-44 bg-linear-to-br from-orange-50 to-orange-100/60 relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-300">
                    {kitchenImage ? (
                      <img
                        src={kitchenImage}
                        alt={`${cook.kitchenName} banner`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-400/80 font-black text-5xl select-none">
                        {cook.kitchenName?.[0] || "K"}
                      </div>
                    )}
                    {cook.mealTypePreference && (
                      <span className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm border tracking-wide ${cook.mealTypePreference === "Veg"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : cook.mealTypePreference === "Both"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                        ● {cook.mealTypePreference === "Both" ? "Veg & Non-Veg" : cook.mealTypePreference}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{cook.kitchenName}</h3>
                      <span className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 shrink-0">
                        ★ {cook.rating ? cook.rating.toFixed(1) : "New"}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cook.cuisineTypes.slice(0, 3).map((cuisine, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lower Action Layout featuring Prices */}
                <div className="p-5 pt-0 mt-auto">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100 text-xs">
                    <div className="text-gray-400 flex items-center gap-1.5 max-w-[65%]">
                      <span>📍</span> <span className="truncate font-medium text-gray-500">{cook.serviceArea}</span>
                    </div>
                    {/* Price Metric Badge */}
                    <div className="text-right shrink-0">
                      <span className="text-gray-400 font-medium">Starts at</span>
                      <p className="font-bold text-gray-900 text-sm">₹{cook.approxPricePerPlate || 150}<span className="text-[10px] text-gray-500 font-normal">/plt</span></p>
                    </div>
                  </div>
                  <a href={`/kitchen/${cook._id}`}>
                    <button className="w-full bg-gray-900 hover:bg-orange-600 text-white font-semibold text-xs py-3 rounded-xl mt-4 transition-all duration-300 shadow-sm tracking-wide">View Kitchen & Menu</button>
                  </a>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}