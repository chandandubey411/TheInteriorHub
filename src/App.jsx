// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Product from "./pages/Product";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
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
          </div>

          {/* Mobile Menu Icon */}
          <button
            className="md:hidden text-2xl text-slate-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden bg-white shadow-inner transition-all duration-300 overflow-hidden ${
            open ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="flex flex-col px-6 py-3 gap-4">
            <Link
              to="/category/modular-kitchen"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
              onClick={() => setOpen(false)}
            >
              Modular Kitchen
            </Link>

            <Link
              to="/category/3d-wall-panel"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
              onClick={() => setOpen(false)}
            >
              Wall Panels
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/product/:slug" element={<Product />} />
        </Routes>
      </main>

      <footer className="mt-12 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Home Interio
      </footer>
    </div>
  );
}
