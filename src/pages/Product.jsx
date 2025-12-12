// src/pages/Product.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import products from "../data/product.json";
import Visualizer from "../components/Visualizer";
import html2canvas from "html2canvas";

/**
 Product page (modified)
 - Request Quote form now posts to Web3Forms (email) using provided access key
 - Keeps the same UI and modal; adds submitting state + message
*/

const WEB3FORMS_KEY = "4c31e106-ed27-43ec-9811-03a496832d22";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);

  // If product not found, simple redirect to home after brief message
  useEffect(() => {
    if (!product) {
      const t = setTimeout(() => navigate("/"), 1600);
      return () => clearTimeout(t);
    }
  }, [product, navigate]);

  // UI state
  const [activeVariant, setActiveVariant] = useState(
    () => Object.keys(product?.views || {})[0] || null
  );
  const [mainIndex, setMainIndex] = useState(0); // which thumbnail is main
  const [isSaved, setIsSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const visRef = useRef(null); // ref to the visualizer container for export

  // update activeVariant when product changes
  useEffect(() => {
    setActiveVariant(Object.keys(product?.views || {})[0] || null);
    setMainIndex(0);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Product not found</h3>
          <p className="text-slate-500 mb-4">Redirecting to home...</p>
          <Link to="/" className="px-4 py-2 bg-amber-600 text-white rounded">Back to Home</Link>
        </div>
      </div>
    );
  }

  const images = activeVariant ? product.views[activeVariant] || [] : product.images || [];

  // Export visual (html2canvas)
  async function handleExport() {
    if (!visRef.current) return;
    try {
      const canvas = await html2canvas(visRef.current, { useCORS: true, scale: 1.5 });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product.slug}.png`;
      a.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed. Try again or use screenshot.");
    }
  }

  // Save design (localStorage)
  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      const designs = JSON.parse(localStorage.getItem("hv_designs") || "[]");
      const entry = {
        id: Date.now(),
        product: product.slug,
        variant: activeVariant,
        createdAt: new Date().toISOString(),
      };
      designs.unshift(entry);
      localStorage.setItem("hv_designs", JSON.stringify(designs));
      setIsSaved(true);
      setSaving(false);
      setTimeout(() => setIsSaved(false), 1600);
    }, 500);
  }

  // Share design (Web Share API)
  async function handleShare() {
    const shareData = {
      title: product.title,
      text: `Check out this product: ${product.title} on Home Interio`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Share aborted", err);
      }
    } else {
      // fallback: copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      } catch {
        alert("Unable to copy. Please copy the URL manually.");
      }
    }
  }

  // New: Web3Forms submit handler
  async function handleQuoteSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const form = e.target;
      const formData = new FormData(form);

      // Add required Web3Forms params
      formData.append("access_key", WEB3FORMS_KEY);
      formData.append("subject", `Quote request — ${product.title}`);
      // optional: include product info
      formData.append("product_slug", product.slug);
      formData.append("product_title", product.title);

      // anti-bot honeypot (leave blank)
      if (!formData.get("botcheck")) {
        formData.set("botcheck", "");
      }

      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSubmitMessage("Quote request submitted. We'll contact you shortly.");
        form.reset();
        // close modal after a short delay
        setTimeout(() => {
          setShowContact(false);
          setSubmitMessage(null);
        }, 2200);
      } else {
        console.error("Web3Forms error:", data);
        setSubmitMessage("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Submit error", err);
      setSubmitMessage("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Thumbnail click handler
  function onThumbClick(idx) {
    setMainIndex(idx);
  }

  // Helper UI pieces
  const priceFormatted = product.price ? `₹${product.price.toLocaleString()}` : "Contact for price";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to={`/category/${product.category?.toLowerCase().replaceAll(" ", "-")}`} className="hover:underline">
          {product.category}
        </Link>{" "}
        / <span className="font-medium">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main content (viewer + thumbnails + details) */}
        <div className="lg:col-span-2 space-y-4">
          <div ref={visRef} className="viewer-canvas rounded-xl p-4 shadow-lg">
            {/* Top small badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded">Featured</span>
                <span className="text-xs text-slate-500">SKU: {product.sku || "—"}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
                  aria-label="Share product"
                >
                  Share
                </button>

                <button
                  onClick={handleExport}
                  className="text-sm px-3 py-1 rounded bg-white border border-slate-200 hover:shadow"
                  aria-label="Export image"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Visualizer component (image-based) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-9">
                {/* Main display area (large image or Visualizer) */}
                <div className="rounded-lg overflow-hidden bg-white">
                  {/* Use Visualizer component to keep logic same across site */}
                  <Visualizer product={product} variant={activeVariant} />
                </div>
              </div>

              {/* Right small thumbnails on desktop */}
              <div className="lg:col-span-3">
                <div className="space-y-3">
                  {/* Variant buttons */}
                  {Object.keys(product.views || {}).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(product.views).map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setActiveVariant(v);
                            setMainIndex(0);
                          }}
                          className={`px-3 py-1 text-sm rounded-full border transition ${
                            activeVariant === v
                              ? "bg-amber-600 text-white border-amber-600"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Thumbnails list */}
                  <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                    {(images.length ? images : product.images || []).map((img, idx) => (
                      <button
                        key={img + idx}
                        onClick={() => onThumbClick(idx)}
                        className={`w-full rounded overflow-hidden border transition ${
                          mainIndex === idx ? "ring-2 ring-amber-300" : "border-slate-200"
                        }`}
                      >
                        <img src={img} alt={`${product.title} view ${idx + 1}`} className="w-full h-20 object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product description / accordion like specs */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold">About this product</h2>
            <p className="text-slate-600 mt-3">{product.description || "High-quality finish and premium material. Contact for custom sizes and installation."}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-500">Material</div>
                <div className="font-medium mt-1">{(product.tags || []).slice(0, 2).join(", ") || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Dimensions</div>
                <div className="font-medium mt-1">
                  {product.dimensions ? `${product.dimensions.w} × ${product.dimensions.h} × ${product.dimensions.d} cm` : "Custom"}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Lead time</div>
                <div className="font-medium mt-1">2–4 weeks</div>
              </div>
            </div>
          </div>

          {/* Related / More products carousel (simple grid) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">You might also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products
                .filter((p) => p.slug !== product.slug && (p.category === product.category || (p.tags || []).some(t => (product.tags || []).includes(t))))
                .slice(0, 6)
                .map((p) => (
                  <Link key={p.slug} to={`/product/${p.slug}`} className="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transform hover:-translate-y-1 transition">
                    <img src={p.images?.[0] || "/images/placeholder.jpg"} alt={p.title} className="w-full h-36 object-cover" loading="lazy" />
                    <div className="p-3">
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="text-slate-500 text-sm mt-1">₹{p.price?.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* Right / Sidebar (sticky on desktop) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-slate-500 text-sm">Price</div>
                  <div className="text-2xl font-bold mt-1">{priceFormatted}</div>
                  <div className="text-sm text-slate-500 mt-1">Inclusive of basic fittings (excl. taxes)</div>
                </div>
                <div className="text-amber-600 font-bold">Save {isSaved ? "✓" : ""}</div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <button
                  onClick={handleSave}
                  className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition"
                >
                  {saving ? "Saving..." : isSaved ? "Saved" : "Save Design"}
                </button>

                <button
                  onClick={() => setShowContact(true)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg hover:shadow transition"
                >
                  Request Quote
                </button>

                <button
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                  className="w-full px-4 py-2 text-sm bg-slate-100 rounded"
                >
                  Contact Installer
                </button>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                <div><strong>SKU:</strong> {product.sku || "—"}</div>
                <div className="mt-1"><strong>Category:</strong> {product.category}</div>
              </div>
            </div>

            {/* Small trust panel */}
            <div className="bg-white p-4 rounded-xl shadow-sm text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">✓</div>
                <div>
                  <div className="font-medium">Quality Guarantee</div>
                  <div className="text-slate-500 text-sm">We use premium materials & certified installers.</div>
                </div>
              </div>
            </div>

            {/* Quick contact */}
            <div className="bg-slate-50 p-4 rounded-xl text-sm">
              <div className="font-medium mb-1">Need a custom quote?</div>
              <div className="text-slate-500 mb-3">Send measurements and we'll respond in 24 hours.</div>
              <button onClick={() => setShowContact(true)} className="px-3 py-2 bg-amber-600 text-white rounded">Send Details</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Contact / Quote modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowContact(false)} />
          <div className="relative max-w-xl w-full bg-white rounded-xl shadow-lg p-6 z-10">
            <h3 className="text-lg font-semibold">Request a Quote</h3>
            <p className="text-slate-500 text-sm mt-1">Share a few details and our team will get back within 24 hours.</p>

            <form
              onSubmit={handleQuoteSubmit}
              className="mt-4 space-y-3"
            >
              {/* Web3Forms fields */}
              <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
              <input type="hidden" name="product_slug" value={product.slug} />
              <input type="hidden" name="product_title" value={product.title} />
              <input type="hidden" name="subject" value={`Quote request — ${product.title}`} />
              {/* honeypot field */}
              <input type="text" name="botcheck" style={{ display: "none" }} tabIndex="-1" autoComplete="off" />

              <input name="name" required placeholder="Your name" className="w-full px-3 py-2 border rounded" />
              <input name="phone" required placeholder="Phone number" className="w-full px-3 py-2 border rounded" />
              <input name="email" placeholder="Email (optional)" className="w-full px-3 py-2 border rounded" />
              <textarea name="message" placeholder="Measurements / Notes (optional)" className="w-full px-3 py-2 border rounded" rows={3} />
              <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={() => setShowContact(false)} className="px-4 py-2 rounded bg-slate-100">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-amber-600 text-white">
                  {submitting ? "Sending..." : "Send Request"}
                </button>
              </div>

              {/* feedback */}
              {submitMessage && <div className="mt-3 text-sm text-emerald-700">{submitMessage}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
