# Detailed Project Report (DPR) - HomeFeast

> **Project Name:** HomeFeast  
> **Platform Type:** Full-Stack Home Food Delivery, Tiffin Service & Catering Platform  
> **Target Audience:** Customers seeking home-cooked meals, Home Chefs/Vendors, and Platform Administrators  
> **Repository Path:** `c:\Users\Lakshya verma\OneDrive\Desktop\Project-food\HomeFeast`

---

## 1. Executive Summary

**HomeFeast** is a full-stack web application designed to connect consumers with local home cooks, tiffin service providers, and catering services. The platform enables home chefs to digitize their kitchens, publish daily/weekly/monthly meal plans, and manage customer orders. Simultaneously, customers get access to authentic, hygiene-verified home-cooked food options with flexible delivery and subscription models.

---

## 2. Complete Folder & File Structure Explanation

```
HomeFeast/
│
├── .gitignore                   # Files and directories ignored by Git version control
├── .oxlintrc.json              # Oxlint linter configuration file
├── package.json                 # Core NPM manifest with scripts & dependencies
├── package-lock.json            # Locked dependency tree for deterministic builds
├── README.md                    # Starter template documentation
├── DETAILED_PROJECT_REPORT.md   # [THIS FILE] Comprehensive Detailed Project Report
│
├── backend/                     # Node.js & Express REST API Server
│   ├── .env                     # Environment variables (Mongo URI, Port, Secrets)
│   ├── server.js                # Main Express server, API endpoints, Mongo connection
│   └── models/                  # Mongoose MongoDB Data Schemas
│       ├── Cook.js              # Home Cook / Kitchen profile schema & pricing plans
│       ├── Dispute.js           # Dispute resolution schema for complaints/issues
│       ├── Menu.js              # Meal & dish item catalog schema
│       ├── Order.js              # Customer food & subscription order schema
│       ├── Subscription.js       # Tiffin plan subscription schema
│       ├── User.js              # Customer user account schema
│       └── Vendor.js            # Dedicated vendor credentials schema
│
├── frontend/                    # React + Vite Client Application
│   ├── dist/                    # Production build output folder
│   ├── index.html               # Main HTML entry point
│   ├── vite.config.js           # Vite build and proxy configuration
│   ├── public/                  # Static assets (images, icons)
│   └── src/                     # React source code
│       ├── main.jsx             # React entry point rendering <App />
│       ├── App.jsx              # Application router, global state & layout container
│       ├── index.css            # Base Tailwind CSS & global styling rules
│       ├── App.css              # Custom component-level utility styles
│       ├── components/          # Reusable UI components
│       │   ├── Navbar.jsx       # Top navigation bar with user auth state & cart count
│       │   ├── Footer.jsx       # Global page footer with quick links & support
│       │   └── CookDirectory.jsx# Filterable directory of verified home cooks & kitchens
│       └── pages/               # Application views & pages
│           ├── home.jsx         # Landing page view
│           ├── userLogin.jsx    # Customer login form page
│           ├── userSignup.jsx   # Customer registration page
│           ├── userDashboard.jsx# Customer profile, orders & subscription management
│           ├── KitchenMenuView.jsx# Kitchen detail view with dish listings & cart actions
│           ├── Checkout.jsx     # Order review, delivery address & payment processing
│           ├── vendorLogin.jsx  # Vendor / Home Chef login page
│           ├── vendorSignup.jsx # Vendor registration page (kitchen submission)
│           ├── cook.jsx         # Vendor management dashboard (dishes, orders, plans)
│           ├── adminLogin.jsx   # Platform administrator login page
│           └── adminDashboard.jsx# Admin dashboard (approvals, disputes, platform metrics)
│
└── scripts/                     # Helper & Seed Scripts
    └── seed-demo-kitchen.mjs    # Database seeding script for sample kitchen & menu items
```

---

## 3. Technology Stack & Dependencies

### **Frontend Stack**
- **Core Framework:** React 19 (`react`, `react-dom`)
- **Build Tooling:** Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Routing:** React Router DOM v7 (`react-router-dom`)
- **Styling:** Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`)
- **Icons:** Lucide React (`lucide-react`)
- **Linting:** Oxlint (`oxlint`)

### **Backend Stack**
- **Runtime:** Node.js (ES Modules)
- **Web Framework:** Express 5 (`express`)
- **Database ODM:** Mongoose 9 (`mongoose`)
- **Authentication & Security:** Bcryptjs (`bcryptjs`)
- **Middleware:** CORS (`cors`), Dotenv (`dotenv`), Nodemon (`nodemon`)

---

## 4. Database Models & Schema Specification

| Model Name | Description & Key Fields | Relational Connections |
| :--- | :--- | :--- |
| **`User.js`** | Customer credentials (`name`, `email`, `password`, `createdAt`) | Referenced in `Order`, `Subscription`, `Cook` |
| **`Cook.js`** | Kitchen profiles (`kitchenName`, `chefName`, `serviceTypes`, `cuisineTypes`, `serviceArea`, `mealTypePreference`, `pricingPlans`, `status`, `isVerified`, `rating`) | Linked to `User` via `userId` |
| **`Menu.js`** | Catalog of dishes (`kitchenId`, `cook`, `title`, `description`, `price`, `mealType`, `category`, `image`, `availability`, `mealPlanType`) | Refers to `Cook` and `User` |
| **`Order.js`** | Order transactions (`userEmail`, `vendorId`, `cartItems`, `deliveryOption`, `paymentMethod`, `deliveryAddress`, `totalAmount`, `status`, `deliveryStatus`, `vendorReview`) | Connected to customer & vendor |
| **`Subscription.js`** | Meal subscription tracking (`customerId`, `cookId`, `planType`, `mealType`, `startDate`, `status`, `pricePaid`) | Refers to `User` & `Cook` |
| **`Dispute.js`** | Escalations & customer support ticket system (`role`, `name`, `email`, `vendorName`, `orderId`, `issue`, `status`) | Linked to orders & users |
| **`Vendor.js`** | Vendor direct access credentials (`email`, `password`, `kitchenName`, `chefName`) | Standalone vendor collection |

---

## 5. Key Functional Modules

### **1. Customer Experience Module**
- **Browse Kitchens:** Search and filter home cooks based on cuisine, veg/non-veg preference, service area, and ratings.
- **Interactive Menu & Cart:** View dish listings, filter by meal plans (daily, weekly, monthly), add items to cart, and modify quantities.
- **Flexible Checkout:** Support for Home Delivery vs. Self Pickup, COD (Cash on Delivery), UPI ID payment, and Credit/Debit Card options.
- **User Dashboard:** Track past orders, monitor active subscription plans, and update personal profiles.

### **2. Home Chef / Vendor Module**
- **Kitchen Onboarding:** Sign up with kitchen details, service types (Catering, Tiffin Service, Home Chef), cuisine specialties, and service areas.
- **Menu Management:** Add, edit, toggle availability, and set pricing for dishes across daily/weekly/monthly options.
- **Order & Delivery Processing:** Receive incoming customer orders, review details, update delivery statuses (`Pending`, `Delivered`, `Not Accepted`), and write vendor feedback.
- **Subscription Management:** View active customer subscriptions and manage meal delivery schedules.

### **3. Admin Management Module**
- **Vendor Approvals:** Review new kitchen registrations (`Pending Approval`) and grant verified status (`Approved`).
- **Platform Analytics:** Overview total users, registered kitchens, total revenue, and active orders.
- **Dispute Settlement:** Review customer and vendor disputes, track order issues, and toggle status between `Open` and `Resolved`.
- **User Management:** Monitor customer list and handle account moderation.

---

## 6. How to Run & Maintain the Project

### **Prerequisites**
- Node.js (v18+ recommended)
- MongoDB server running locally at `mongodb://127.0.0.1:27017/homefeast` or a configured MongoDB Atlas URI in `backend/.env`.

### **Environment Setup**
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/homefeast
```

### **Command Scripts**
- **Start Development Mode (Frontend & Vite server):**
  ```bash
  npm run dev
  ```
- **Start Backend API Server (Node/Nodemon):**
  ```bash
  npm start
  ```
- **Build Frontend Production Bundle:**
  ```bash
  npm run build
  ```
- **Lint Frontend Source Code:**
  ```bash
  npm run lint
  ```
- **Seed Demo Data:**
  ```bash
  node scripts/seed-demo-kitchen.mjs
  ```

---

## 7. Quick Navigation Links

- **Main Report File:** [DETAILED_PROJECT_REPORT.md](file:///c:/Users/Lakshya%20verma/OneDrive/Desktop/Project-food/HomeFeast/DETAILED_PROJECT_REPORT.md)
- **Backend Entry Server:** [server.js](file:///c:/Users/Lakshya%20verma/OneDrive/Desktop/Project-food/HomeFeast/backend/server.js)
- **Frontend App Router:** [App.jsx](file:///c:/Users/Lakshya%20verma/OneDrive/Desktop/Project-food/HomeFeast/frontend/src/App.jsx)
- **Root Manifest:** [package.json](file:///c:/Users/Lakshya%20verma/OneDrive/Desktop/Project-food/HomeFeast/package.json)

---
*Report Generated for HomeFeast Project Workspace.*
