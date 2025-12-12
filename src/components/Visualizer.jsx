// src/components/Visualizer.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";

/**
 Visualizer.jsx
 - Renders <model-viewer> when product has gltf (string or variant map)
 - Otherwise shows image gallery with thumbnails + fullscreen modal
 - Dynamically loads model-viewer script in browser if needed
*/

export default function Visualizer({ product, variant = null }) {
  // images for chosen variant or default images
  const imgs =
    variant && product?.views && product.views[variant]
      ? product.views[variant]
      : product?.images || [];

  // gltf handling: string or object (variant -> url)
  const gltfSource = (() => {
    if (!product?.gltf) return null;
    if (typeof product.gltf === "string") return product.gltf;
    if (variant && product.gltf[variant]) return product.gltf[variant];
    // fallback to first value
    if (typeof product.gltf === "object") {
      const vals = Object.values(product.gltf);
      return vals.length ? vals[0] : null;
    }
    return null;
  })();

  // compute normalizedGltf synchronously so model-viewer never sees a bad url
  const normalizedGltf = useMemo(() => {
    if (!gltfSource) return null;
    let s = String(gltfSource);

    // 1) remove accidental duplicate '/.vercel.app/' segments
    s = s.replace(/\/\.vercel\.app\//g, "/");

    // 2) convert absolute vercel-host URLs to root-relative paths
    try {
      if (/^https?:\/\//i.test(s)) {
        const u = new URL(s);
        if (u.hostname.endsWith(".vercel.app")) {
          s = u.pathname + u.search + u.hash;
        }
      }
    } catch (err) {
      // ignore
    }

    // 3) ensure root-relative or absolute http(s)
    if (!s.startsWith("/") && !/^https?:\/\//i.test(s)) {
      s = "/" + s;
    }

    return s;
  }, [gltfSource]);

  // Load model-viewer script dynamically and track readiness
  const [modelViewerReady, setModelViewerReady] = useState(() => {
    return typeof window !== "undefined" && !!window.customElements && !!window.customElements.get("model-viewer");
  });

  useEffect(() => {
    if (modelViewerReady) return;

    // if it's already registered (race), mark ready
    if (typeof window !== "undefined" && window.customElements && window.customElements.get("model-viewer")) {
      setModelViewerReady(true);
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.async = true;

    const onLoad = () => {
      // small delay to allow registration
      setTimeout(() => setModelViewerReady(true), 50);
    };
    const onErr = (e) => {
      console.error("model-viewer failed to load", e);
      // leave modelViewerReady false -> fallback UI will remain
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onErr);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onErr);
      // do not remove script from DOM on cleanup to avoid reloading repeatedly
    };
  }, [modelViewerReady]);

  const [mainIndex, setMainIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    // reset main image if variant changes
    setMainIndex(0);
  }, [variant, product?.slug]);

  // keyboard nav for modal
  useEffect(() => {
    function onKey(e) {
      if (!isModalOpen) return;
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") setMainIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setMainIndex((i) => Math.min((imgs.length || 1) - 1, i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, imgs.length]);

  // Render 3D viewer only if model path exists and model-viewer is ready
  if (gltfSource) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-500">3D Preview</div>
          <div className="text-xs text-slate-400">Drag to rotate, pinch to zoom</div>
        </div>

        <div className="rounded-lg overflow-hidden bg-white">
          {modelViewerReady ? (
            <model-viewer
              src={normalizedGltf || gltfSource}
              alt={product?.title || "3D model"}
              camera-controls
              auto-rotate
              interaction-prompt="auto"
              shadow-intensity="1"
              exposure="1"
              ar
              style={{ width: "100%", height: "480px", backgroundColor: "#f8fafc" }}
              poster={product?.images && product.images[0] ? product.images[0] : undefined}
              loading="eager"
              crossorigin="anonymous"
            />
          ) : (
            // placeholder while model-viewer script loads or if it failed
            <div style={{ width: "100%", height: 480, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
              <div className="text-slate-400">Loading 3D preview…</div>
            </div>
          )}
        </div>

        {/* Thumbnails / variant images (optional) */}
        {imgs && imgs.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {imgs.map((t, idx) => (
              <button
                key={t + idx}
                onClick={() => {
                  setMainIndex(idx);
                  setIsModalOpen(true);
                }}
                className="overflow-hidden rounded-md border hover:shadow transition"
                aria-label={`Open view ${idx + 1}`}
              >
                <img src={t} alt={`${product?.title || "product"} thumb ${idx + 1}`} className="w-full h-20 object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {/* Image modal for detail views */}
        {isModalOpen && imgs && imgs.length > 0 && (
          <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white bg-black/40 rounded-full p-2">✕</button>
            <div className="max-w-4xl w-full">
              <img src={imgs[mainIndex]} alt={`${product?.title || "product"} large ${mainIndex + 1}`} className="w-full h-[70vh] object-contain rounded shadow-lg bg-white" />
              <div className="mt-3 flex items-center justify-center gap-3">
                <button onClick={() => setMainIndex((i) => Math.max(0, i - 1))} className="px-3 py-2 bg-white rounded">←</button>
                <div className="text-white">{mainIndex + 1} / {imgs.length}</div>
                <button onClick={() => setMainIndex((i) => Math.min(imgs.length - 1, i + 1))} className="px-3 py-2 bg-white rounded">→</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: image-based visualizer when no gltf present
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-500">Preview</div>
        <div className="text-xs text-slate-400">Tap image to enlarge</div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <button onClick={() => setIsModalOpen(true)} className="w-full block focus:outline-none" aria-label="Open preview">
          <img src={imgs[mainIndex] || "/images/placeholder.jpg"} alt={`${product?.title || "product"} view ${mainIndex + 1}`} className="w-full h-80 object-cover rounded transition-transform duration-500 hover:scale-105" loading="lazy" />
        </button>
      </div>

      {imgs && imgs.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {imgs.map((t, idx) => (
            <button key={t + idx} onClick={() => setMainIndex(idx)} className={`overflow-hidden rounded-md border transition ${ mainIndex === idx ? "ring-2 ring-amber-300" : "border-slate-200" }`} aria-label={`Select view ${idx + 1}`}>
              <img src={t} alt={`${product?.title || "product"} thumb ${idx + 1}`} className="w-full h-20 object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {isModalOpen && imgs && imgs.length > 0 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="relative max-w-5xl w-full">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-3 top-3 z-50 text-white bg-black/40 rounded-full p-2">✕</button>
            <img src={imgs[mainIndex]} alt={`${product?.title || "product"} large ${mainIndex + 1}`} className="w-full h-[80vh] object-contain rounded" />
            <div className="mt-3 flex items-center justify-center gap-3">
              <button onClick={() => setMainIndex((i) => Math.max(0, i - 1))} className="px-3 py-2 bg-white rounded">←</button>
              <div className="text-sm text-white">{mainIndex + 1} / {imgs.length}</div>
              <button onClick={() => setMainIndex((i) => Math.min(imgs.length - 1, i + 1))} className="px-3 py-2 bg-white rounded">→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
