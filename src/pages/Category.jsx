// src/pages/Category.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import productsData from "../data/product.json";

// currency formatter
const formatCurrency = (n) => (n || n === 0 ? "₹" + n.toLocaleString() : "-");

// MASTER CATEGORY MAP (slug -> array of accepted exact product.category values)
// Add synonyms / alternate names here for robust matching.
const CATEGORY_MAP = {
  "modular-kitchen": ["Modular Kitchen"],
  "3d-wall-panel": ["3D Wall Panel"],
  "pvc-ceiling-panel": ["PVC Wall Panel", "PVC Ceiling Panel"],
  "wpc-wall-panel": ["WPC Wall Panel"],
  "charcoal-panel": ["Charcoal Panel"],
  "luxury-shop-interior": ["Luxury Shop Interior"],
  "flat-interior-2bhk": ["Flat Interior"],
  // NEW categories requested:
  "home-interior": ["Home Interior", "Home Interiors", "Interior Solutions"],
  "flat-interior": ["Flat Interior", "Apartment Interior"],
  "home-renovation": ["Home Renovation", "Renovation"],
  "flat-renovation": ["Flat Renovation", "Apartment Renovation"],
  "floated-wall-panel": ["Floated Wall Panel", "Floating Wall Panel", "Floated Panel", "Wall Panel"],
};

// utility: normalize string
const norm = (s = "") => String(s || "").trim().toLowerCase();

// helper: make unique by slug
const uniqueBySlug = (arr) => {
  const seen = new Set();
  const out = [];
  for (const i of arr) {
    if (!i || !i.slug) continue;
    if (seen.has(i.slug)) continue;
    seen.add(i.slug);
    out.push(i);
  }
  return out;
};

export default function Category() {
  const { slug } = useParams();
  const slugText = slug?.replaceAll("-", " ") || "";

  const initialList = useMemo(() => {
    if (!slug) return [];

    const target = String(slug).toLowerCase();

    // 1) Try exact mapped categories first
    const mappedCategories = CATEGORY_MAP[target] || [];
    let results = [];
    if (mappedCategories.length) {
      results = productsData.filter((p) =>
        mappedCategories.some((mc) => norm(p.category) === norm(mc))
      );
    }

    // If mapping returned multiple items, return them (likely correct)
    if (results.length > 1) {
      return uniqueBySlug(results);
    }

    // slugify helper (for product.category)
    const slugify = (text = "") =>
      String(text)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-");

    // 2) Exact category slug match
    const byCategorySlug = productsData.filter((p) => slugify(p.category) === target);
    if (byCategorySlug.length > 1) return uniqueBySlug(byCategorySlug);

    // 3) Exact product.slug match
    const byProductSlug = productsData.filter((p) => norm(p.slug) === target);
    if (byProductSlug.length > 0) return uniqueBySlug(byProductSlug);

    // 4) Exact tag match
    const byTag = productsData.filter((p) =>
      (p.tags || []).some((t) => norm(t) === target || slugify(t) === target)
    );
    if (byTag.length > 1) return uniqueBySlug(byTag);

    // 5) KEYWORDS fallback: split slug into keywords and match as substring
    const rawKeywords = target.split("-").filter(Boolean);
    const stopwords = new Set(["and", "the", "of", "in", "panel", "interior"]);
    const keywords = rawKeywords.filter((k) => !stopwords.has(k) && k.length > 1);

    if (keywords.length) {
      const byKeywords = productsData.filter((p) => {
        const cat = norm(p.category || "");
        const ps = norm(p.slug || "");
        const tags = (p.tags || []).map((t) => norm(t));
        return keywords.some((kw) => {
          if (!kw) return false;
          if (cat.includes(kw)) return true;
          if (ps.includes(kw)) return true;
          if (tags.some((t) => t.includes(kw))) return true;
          return false;
        });
      });
      if (byKeywords.length > 0) {
        const combined = uniqueBySlug([...(results || []), ...byKeywords]);
        return combined;
      }
    }

    // 6) Loose token match in slugified category/slug
    const loose = productsData.filter((p) => {
      const cat = slugify(p.category || "");
      const ps = norm(p.slug || "");
      const tokens = [...new Set([...cat.split("-"), ...ps.split("-")])];
      return tokens.includes(target);
    });
    if (loose.length) return uniqueBySlug(loose);

    // 7) Fallback: if mapping gave single result, return it
    if (results.length) return uniqueBySlug(results);

    return [];
  }, [slug]);

  // derive tags from initialList
  const allTags = Array.from(new Set(initialList.flatMap((p) => p.tags || [])));

  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const prices = initialList.map((p) => p.price || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 999999;
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setQuery("");
    setActiveTags([]);
    setPriceRange([minPrice, maxPrice]);
    setSortBy("relevance");
    setShowFilters(false);
  }, [slug]);

  const filtered = useMemo(() => {
    let list = [...initialList];

    // search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.tags || []).join(" ").toLowerCase().includes(q)
      );
    }

    // tag filter
    if (activeTags.length) {
      list = list.filter((p) => activeTags.every((t) => (p.tags || []).includes(t)));
    }

    // price range
    list = list.filter((p) => (p.price || 0) >= priceRange[0] && p.price <= priceRange[1]);

    // sort
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") list.sort((a, b) => b.id - a.id);

    return list;
  }, [initialList, query, activeTags, priceRange, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{slugText.toUpperCase()}</h1>
          <p className="text-slate-500 mt-1">Explore curated products in {slugText}.</p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded bg-white"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="md:hidden mb-3 flex items-center justify-between">
            <button onClick={() => setShowFilters(!showFilters)} className="px-3 py-2 bg-amber-600 text-white rounded">
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <div className="text-sm text-slate-500">{filtered.length} items</div>
          </div>

          <div className={`${showFilters ? "block" : "hidden"} md:block`}>
            <div className="bg-white p-4 rounded shadow mb-4">
              <label className="block text-sm font-medium mb-2">Search</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, tags..." className="w-full px-3 py-2 border rounded" />
            </div>

            <div className="bg-white p-4 rounded shadow mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Materials & Tags</h3>
                <button onClick={() => setActiveTags([])} className="text-xs text-slate-500 hover:underline">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.length === 0 && <div className="text-sm text-slate-400">No tags</div>}
                {allTags.map((t) => {
                  const active = activeTags.includes(t);
                  return (
                    <button key={t} onClick={() => setActiveTags((prev) => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]))} className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-slate-200"}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm">
              <h3 className="text-xl font-semibold">No products found</h3>
              <p className="text-slate-500 mt-2">Try a different category or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Link key={p.slug} to={`/product/${p.slug}`} className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                  <img src={p.images?.[0]} alt={p.title} className="w-full h-56 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-slate-500 mt-2">{formatCurrency(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
