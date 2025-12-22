// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Product from "./pages/Product";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";

const CATEGORIES = [
  { title: "Modular Kitchen", slug: "modular-kitchen" },
  { title: "3D Wall Panel", slug: "3d-wall-panel" },
  { title: "PVC Ceiling", slug: "pvc-ceiling-panel" },
  { title: "WPC Wall Panel", slug: "wpc-wall-panel" },
  { title: "Charcoal Panel", slug: "charcoal-panel" },
  { title: "Luxury Interiors", slug: "luxury-shop-interior" },
  { title: "Home Interior", slug: "home-interior" },
  { title: "Flat Interior", slug: "flat-interior" },
  { title: "Home Renovation", slug: "home-renovation" },
  { title: "Flat Renovation", slug: "flat-renovation" },
  { title: "Floated Wall Panel", slug: "floated-wall-panel" },
];

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="The Interior Hub Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-xl tracking-wide text-slate-800">
              THE INTERIOR HUB
            </span>
          </Link>

          {/* Desktop menu: visible on md+ */}
          <div className="hidden md:flex items-center gap-6">
            {/* Two primary quick links (kept as before) */}
            <Link
              to="/category/modular-kitchen"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Modular Kitchen
            </Link>

            <Link
              to="/category/3d-wall-panel"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Wall Panels
            </Link>

            {/* Categories dropdown (desktop) */}
            <div className="relative group">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2">
                Categories
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div
                className="absolute left-0 mt-2 bg-white shadow-lg rounded-md p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[220px]"
                aria-hidden
              >
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/category/${c.slug}`}
                    className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/blog"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Blog
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              className="ml-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-2xl text-slate-700"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setOpen(false)}
        >
          <div
            className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-xl transform transition-transform duration-300 ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="font-semibold text-lg text-slate-800">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl text-slate-700"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
              {/* Primary Links */}
              <div className="space-y-3">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="block text-slate-800 font-medium"
                >
                  Home
                </Link>

                <Link
                  to="/category/modular-kitchen"
                  onClick={() => setOpen(false)}
                  className="block text-slate-800 font-medium"
                >
                  Modular Kitchen
                </Link>

                <Link
                  to="/category/3d-wall-panel"
                  onClick={() => setOpen(false)}
                  className="block text-slate-800 font-medium"
                >
                  Wall Panels
                </Link>

                <Link
                  to="/blog"
                  onClick={() => setOpen(false)}
                  className="block text-slate-800 font-medium"
                >
                  Blog
                </Link>
              </div>

              <hr />

              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-3">
                  All Categories
                </h4>

                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100"
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              </div>

              <hr />

              {/* Contact */}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="block text-center bg-amber-600 text-white py-3 rounded-lg font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/product/:slug" element={<Product />} />
        </Routes>
      </main>

      <footer className="mt-16 bg-slate-900 text-slate-300">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo + About */}
          <div>
            <h2 className="text-xl font-semibold text-white">
              THE INTERIOR HUB
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Premium modular kitchens, wall panels, interiors & renovation
              services with high-quality craftsmanship.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/category/modular-kitchen"
                  className="hover:text-white"
                >
                  Modular Kitchen
                </Link>
              </li>
              <li>
                <Link to="/category/3d-wall-panel" className="hover:text-white">
                  Wall Panels
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/home-interior" className="hover:text-white">
                  Home Interior
                </Link>
              </li>
              <li>
                <Link to="/category/flat-interior" className="hover:text-white">
                  Flat Interior
                </Link>
              </li>
              <li>
                <Link
                  to="/category/home-renovation"
                  className="hover:text-white"
                >
                  Home Renovation
                </Link>
              </li>
              <li>
                <Link
                  to="/category/floated-wall-panel"
                  className="hover:text-white"
                >
                  Floated Wall Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📞 +91 99999 93798</li>
              <li>✉️ Shoaibjmd91@gmail.com</li>
              <li>
                📍 C-28, Parwana Rd, OLd Govindpura, Krishna Nagar, New Delhi,
                Delhi, 110051
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} THE INTERIOR HUB — All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
