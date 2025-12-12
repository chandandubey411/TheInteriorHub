// src/pages/Category.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import productsData from "../data/product.json";

/**
 Category page features:
 - Reads :slug from route (e.g., /category/modular-kitchen)
 - Shows filters: search text, tags (generated from products), price range, sort
 - Responsive filter panel (collapsible on mobile)
 - Animated product grid (simple fade/translate on mount)
 - Handles no-results state with CTA
*/

function formatCurrency(n) {
  if (!n && n !== 0) return "-";
  return "₹" + n.toLocaleString();
}

export default function Category() {
  const { slug } = useParams();
  const slugText = slug?.replaceAll("-", " ") || "";
  // default list: products that match category (loosely)
  const initialList = useMemo(
    () =>
      productsData.filter(
        (p) =>
          (p.category && p.category.toLowerCase().includes(slugText.toLowerCase())) ||
          (p.slug && p.slug.toLowerCase().includes(slugText.toLowerCase())) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(slugText.toLowerCase())))
      ),
    [slugText]
  );

  // derive all available tags & price range from initialList (or all products)
  const allTags = useMemo(() => {
    const s = new Set();
    (initialList.length ? initialList : productsData).forEach((p) => {
      (p.tags || []).forEach((t) => s.add(t));
    });
    return Array.from(s);
  }, [initialList]);

  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]); // selected tag filters
  const prices = useMemo(() => initialList.map((p) => p.price || 0), [initialList]);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1000000;
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [sortBy, setSortBy] = useState("relevance"); // relevance, price-asc, price-desc, newest (by id)
  const [showFilters, setShowFilters] = useState(false);

  // When slug changes, reset filters
  useEffect(() => {
    setQuery("");
    setActiveTags([]);
    setPriceRange([minPrice, maxPrice]);
    setSortBy("relevance");
    setShowFilters(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Filter + search + sort logic
  const filtered = useMemo(() => {
    let list = initialList.length ? initialList.slice() : productsData.slice();

    // text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.tags && p.tags.join(" ").toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // tag filters (AND logic: product must have all selected tags)
    if (activeTags.length) {
      list = list.filter((p) => activeTags.every((t) => (p.tags || []).includes(t)));
    }

    // price filter
    list = list.filter((p) => {
      const pr = p.price || 0;
      return pr >= priceRange[0] && pr <= priceRange[1];
    });

    // sort
    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    } // relevance: keep as is

    return list;
  }, [initialList, query, activeTags, priceRange, sortBy]);

  // small animation on mount for product cards (stagger)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // helpers for toggling tags
  function toggleTag(tag) {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  // simple price range inputs (two number inputs for simplicity + slider fallback)
  const minRef = useRef(null);
  const maxRef = useRef(null);

  function applyPriceInputs() {
    const minV = Number(minRef.current.value || 0);
    const maxV = Number(maxRef.current.value || 0);
    if (minV <= maxV) setPriceRange([minV, maxV]);
  }

  return (
    <div className="space-y-8">
      {/* Header / breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{slugText.toUpperCase()}</h1>
          <p className="text-slate-500 mt-1">Explore curated products in {slugText} — filter by material, price & more.</p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="text-sm text-slate-600">Sort</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded border border-slate-200 bg-white"
            aria-label="Sort products"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters column */}
        <aside className="lg:col-span-1">
          {/* Mobile filter toggle */}
          <div className="md:hidden mb-3 flex items-center justify-between">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="px-3 py-2 bg-amber-600 text-white rounded-lg shadow-sm"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <div className="text-sm text-slate-500">{filtered.length} items</div>
          </div>

          <div className={`${showFilters ? "block" : "hidden"} md:block`}>
            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, tags..."
                className="w-full px-3 py-2 border border-slate-200 rounded"
              />
            </div>

            {/* Tags */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-700">Materials & Tags</h3>
                <button
                  onClick={() => setActiveTags([])}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.length === 0 && <div className="text-sm text-slate-400">No tags</div>}
                {allTags.map((t) => {
                  const active = activeTags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1 rounded-full text-sm border transition ${
                        active ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-slate-200"
                      }`}
                      aria-pressed={active}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <h3 className="font-medium text-slate-700 mb-2">Price range</h3>
              <div className="flex items-center gap-2">
                <input
                  ref={minRef}
                  type="number"
                  defaultValue={priceRange[0]}
                  className="w-1/2 px-2 py-1 border rounded"
                  min="0"
                />
                <input
                  ref={maxRef}
                  type="number"
                  defaultValue={priceRange[1]}
                  className="w-1/2 px-2 py-1 border rounded"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={applyPriceInputs}
                  className="px-3 py-2 bg-slate-800 text-white rounded"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setPriceRange([minPrice, maxPrice]);
                    if (minRef.current) minRef.current.value = minPrice;
                    if (maxRef.current) maxRef.current.value = maxPrice;
                  }}
                  className="px-3 py-2 bg-slate-100 rounded"
                >
                  Reset
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-3">
                Showing: {formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}
              </div>
            </div>

            {/* Quick CTA */}
            <div className="bg-amber-600 text-white p-4 rounded-xl shadow-sm">
              <h4 className="font-semibold">Need help choosing?</h4>
              <p className="text-sm mt-2">Request a free consultation and quote for your space.</p>
              <Link to="/contact" className="inline-block mt-3 bg-white text-amber-600 px-4 py-2 rounded">
                Request Quote
              </Link>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <section className="lg:col-span-3">
          {/* top controls visible on mobile */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <div className="text-sm text-slate-500">{filtered.length} results</div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded border border-slate-200 bg-white"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm">
              <h3 className="text-xl font-semibold">No products found</h3>
              <p className="text-slate-500 mt-2">Try removing filters or check other categories.</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Link to="/" className="px-4 py-2 bg-amber-600 text-white rounded">Back to Home</Link>
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveTags([]);
                    setPriceRange([minPrice, maxPrice]);
                  }}
                  className="px-4 py-2 bg-slate-100 rounded"
                >
                  Reset filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, idx) => (
                <article
                  key={p.slug}
                  className={`bg-white rounded-xl overflow-hidden shadow transform transition duration-400 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <Link to={`/product/${p.slug}`} className="group block">
                    <div className="relative">
                      <img
                        src={p.images?.[0] || "/images/placeholder.jpg"}
                        alt={p.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-amber-600 text-white text-xs px-2 py-1 rounded">View</div>
                      <div className="absolute right-3 bottom-3 bg-white/80 text-slate-800 text-sm px-2 py-1 rounded backdrop-blur-sm">
                        {formatCurrency(p.price)}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {p.description || "High-quality finish. Click to preview variants & request a quote."}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-slate-500">{(p.tags || []).slice(0, 3).join(", ")}</div>
                        <div className="flex items-center gap-2">
                          <button className="text-sm px-3 py-1 bg-slate-100 rounded hover:bg-slate-200">Details</button>
                          <Link to={`/product/${p.slug}`} className="text-sm px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700">
                            Quote
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
