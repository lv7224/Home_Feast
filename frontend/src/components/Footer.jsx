import React, { useEffect, useState } from "react";

const Footer = () => {
  const [formData, setFormData] = useState({
    role: "User",
    name: "",
    email: "",
    vendorName: "",
    orderId: "",
    issue: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    const currentVendor = JSON.parse(localStorage.getItem("currentVendor") || localStorage.getItem("vendor") || "null");

    if (currentVendor?.email) {
      setFormData((prev) => ({
        ...prev,
        role: "Vendor",
        name: currentVendor.kitchenName || currentVendor.chefName || "",
        email: currentVendor.email,
      }));
    } else if (currentUser?.email) {
      setFormData((prev) => ({
        ...prev,
        role: "User",
        name: currentUser.name || "",
        email: currentUser.email,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.issue.trim()) {
      setError("Please provide your name, email, and a short issue description.");
      return;
    }

    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send complaint.");
      }

      setStatus("Your complaint has been submitted to admin. Thank you.");
      setNotification({ message: "Complaint submitted successfully.", type: "success" });
      setFormData((prev) => ({
        ...prev,
        orderId: "",
        vendorName: "",
        issue: "",
      }));
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } catch (err) {
      setError(err.message || "Unable to submit complaint at this time.");
      setNotification({ message: "Unable to submit complaint. Please try again.", type: "error" });
    }
  };

  return (
    <footer className="bg-gray-950 text-white border-t border-gray-800 mt-12">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold">Need support? File a complaint or dispute.</h2>
            <p className="mt-3 max-w-xl text-sm text-gray-300">
              Users and vendors can send complaints directly to the admin dashboard. Describe your issue clearly and the support team will review it.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-black/20">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-gray-300">
                I am a
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none"
                >
                  <option>User</option>
                  <option>Vendor</option>
                </select>
              </label>
              <label className="block text-sm text-gray-300">
                Name
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Email
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Related Kitchen / Vendor
                <input
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Kitchen name or vendor"
                  className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none"
                />
              </label>
            </div>

            <label className="block mt-4 text-sm text-gray-300">
              Order / Reference ID (optional)
              <input
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                placeholder="Order ID or ticket reference"
                className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none"
              />
            </label>

            <label className="block mt-4 text-sm text-gray-300">
              Complaint / Dispute details
              <textarea
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the issue you want admin to resolve."
                className="mt-2 w-full rounded-3xl border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-white outline-none"
              />
            </label>

            {status && <p className="mt-3 text-sm text-emerald-400">{status}</p>}
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            {notification.message && (
              <div className={`mt-3 rounded-2xl px-4 py-3 text-sm ${notification.type === "success" ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400" : "bg-rose-500/15 text-rose-200 border border-rose-400"}`}>
                {notification.message}
              </div>
            )}

            <button
              type="submit"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-400"
            >
              Send Complaint
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
