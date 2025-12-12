// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/product.json";

/**
 Home page:
 - Hero with animated CTA and floating accent
 - Categories section (hard-coded slugs; link to /category/:slug)
 - Featured products grid with reveal-on-scroll animation (IntersectionObserver)
 - Quick "Why choose us" cards with icons and small animations
*/

const CATEGORIES = [
  {
    title: "Modular Kitchen",
    slug: "modular-kitchen",
    subtitle: "HDHMR, Wooden, Aluminium",
  },
  {
    title: "3D Wall Panel",
    slug: "3d-wall-panel",
    subtitle: "Luxury textures & patterns",
  },
  {
    title: "PVC Ceiling",
    slug: "pvc-ceiling-panel",
    subtitle: "Lightweight & waterproof",
  },
  {
    title: "WPC Wall Panel",
    slug: "wpc-wall-panel",
    subtitle: "Durable & elegant",
  },
  {
    title: "Charcoal Panel",
    slug: "charcoal-panel",
    subtitle: "Bold 3D finishes",
  },
  {
    title: "Luxury Interiors",
    slug: "luxury-shop-interior",
    subtitle: "Showroom & shop fitouts",
  },

  // NEW CATEGORIES ↓↓↓
  {
    title: "Home Interior",
    slug: "home-interior",
    subtitle: "Complete interior solutions",
  },
  {
    title: "Flat Interior",
    slug: "flat-interior",
    subtitle: "2BHK / 3BHK interiors",
  },
  {
    title: "Home Renovation",
    slug: "home-renovation",
    subtitle: "Full home transformation",
  },
  {
    title: "Flat Renovation",
    slug: "flat-renovation",
    subtitle: "Kitchen + Living + Bedroom",
  },
  {
    title: "Floated Wall Panel",
    slug: "floated-wall-panel",
    subtitle: "Modern floating panels",
  },
];

export default function Home() {
  const featured = products.slice(0, 6); // choose first 6 as featured
  const cardsRef = useRef([]);
  const [inView, setInView] = useState({}); // track which product cards are in view

  useEffect(() => {
    // IntersectionObserver to add in-view class for staggered reveal
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = entry.target.getAttribute("data-idx");
            setInView((s) => ({ ...s, [idx]: true }));
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cardsRef.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white overflow-hidden rounded-lg">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              The Interior Hub —{" "}
              <span className="text-amber-600">Premium Interiors</span> for
              every space
            </h1>
            <p className="text-slate-600 max-w-xl">
              Modular kitchens, 3D wall panels, PVC & WPC panels, and luxury
              store interiors — curated designs, realistic previews and fast
              quotes. Get a premium look without the premium hassle.
            </p>

            <div className="flex gap-3 items-center">
              <Link
                to="/category/modular-kitchen"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-lg font-medium shadow-md transform hover:-translate-y-0.5 transition"
                aria-label="Explore Modular Kitchens"
              >
                Explore Kitchens
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>

              <button
                onClick={() =>
                  window.scrollTo({ top: 800, behavior: "smooth" })
                }
                className="px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:shadow-md transition"
              >
                View Catalog
              </button>

              <Link
                to="/contact"
                className="px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:shadow-md transition inline-block"
              >
                Contact Us
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />{" "}
                Free Quote
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />{" "}
                2–3 day mockups
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />{" "}
                Easy installation
              </div>
            </div>
          </div>

          {/* Right hero image with floating accent */}
          <div className="relative">
            <div className="viewer-canvas rounded-xl p-4 shadow-xl border border-slate-100">
              <img
                src={featured[0]?.images?.[0] || "/images/placeholder.jpg"}
                alt="Hero preview"
                className="w-full h-72 sm:h-80 object-cover rounded-lg shadow"
              />
            </div>

            {/* Floating accent circle */}
            <div
              aria-hidden
              className="hidden md:block absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-300 to-pink-300 opacity-40 blur-3xl animate-float"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-4">Explore by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="group bg-white rounded-xl p-4 flex flex-col items-start gap-3 shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-amber-500 group-hover:bg-amber-50 transition">
                {/* simple svg icon */}
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 7v10a1 1 0 0 0 1 1h4V6H4a1 1 0 0 0-1 1z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M14 6v12h5a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{c.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="featured" className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <Link
            to="/category/modular-kitchen"
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p, idx) => {
            const visible = !!inView[idx];
            return (
              <article
                key={p.slug}
                data-idx={idx}
                ref={(el) => (cardsRef.current[idx] = el)}
                className={`bg-white rounded-xl overflow-hidden shadow-lg transform transition ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <Link to={`/product/${p.slug}`} className="group block">
                  <div className="relative">
                    <img
                      src={p.images?.[0] || "/images/placeholder.jpg"}
                      alt={p.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                      Top pick
                    </div>
                    <div className="absolute right-3 bottom-3 bg-white/80 text-slate-800 text-sm px-2 py-1 rounded backdrop-blur-sm">
                      ₹{p.price?.toLocaleString?.() ?? p.price}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{p.title}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {p.description ||
                        "High-quality material and finish. Click to see variants & preview."}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        {p.tags?.join?.(", ")}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-sm px-3 py-1 bg-slate-100 rounded hover:bg-slate-200">
                          View
                        </button>
                        <button className="text-sm px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700">
                          Quote
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-4">Why Home Interio?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="text-amber-600 mb-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 8v4l3 3"
                />
              </svg>
            </div>
            <h4 className="font-semibold">Fast Turnaround</h4>
            <p className="text-sm text-slate-500 mt-2">
              Mockups in 2–3 business days. Quick quotes & delivery scheduling.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="text-amber-600 mb-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
            </div>
            <h4 className="font-semibold">Wide Catalog</h4>
            <p className="text-sm text-slate-500 mt-2">
              Kitchens, wall panels, ceiling systems, and showroom interiors —
              all in one place.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="text-amber-600 mb-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 20l9-5-9-5-9 5 9 5z"
                />
              </svg>
            </div>
            <h4 className="font-semibold">Quality Guarantee</h4>
            <p className="text-sm text-slate-500 mt-2">
              Premium materials and professional installation partners across
              the city.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
