// src/pages/Contact.jsx

import React, { useState } from "react";

// Contact page component
// Usage: add a route in App.jsx: <Route path="/contact" element={<Contact />} />
// This form uses Web3Forms (same pattern as Product.jsx). Replace WEB3FORMS_KEY with your key if different.

const WEB3FORMS_KEY = "4c31e106-ed27-43ec-9811-03a496832d22";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const form = e.target;
      const formData = new FormData(form);

      // required by web3forms
      formData.set("access_key", WEB3FORMS_KEY);
      formData.set("subject", `Contact request — ${formData.get("name") || "Guest"}`);

      // minimal anti-bot honeypot
      if (!formData.get("botcheck")) formData.set("botcheck", "");

      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Message sent — we'll contact you soon." });
        form.reset();
      } else {
        console.error("Web3Forms error", data);
        setMessage({ type: "error", text: "Submission failed. Please try again later." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-slate-600 mb-6">Have a question about a product, need a custom quote, or want help with measurements? Send us a message — we usually reply within 24 hours.</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Call / WhatsApp</h3>
              <div className="text-slate-700">+91 9999993798</div>
            </div>

            <div>
              <h3 className="font-medium">Email</h3>
              <div className="text-slate-700">Shoaibjmd91@gmail.com</div>
            </div>

            <div>
              <h3 className="font-medium">Visit our showroom</h3>
              <div className="text-slate-700">C-28, Parwana Rd, OLd Govindpura, Krishna Nagar, New Delhi, Delhi, 110051</div>
            </div>
          </div>

          <div className="mt-6">
            {/* Optional simple embedded map (replace src with your map URL if you want) */}
            <iframe
              title="Showroom Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112068.6082221018!2d77.10830192581577!3d28.625445782200917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd52392c0f95%3A0x48377f2e55a65880!2sTHE%20INTERIOR%20HUB!5e0!3m2!1sen!2sin!4v1765553424414!5m2!1sen!2sin"
              width="100%"
              height="220"
              className="rounded-md border"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* honeypot */}
            <input type="text" name="botcheck" tabIndex="-1" autoComplete="off" style={{ display: "none" }} />

            <div>
              <label className="text-sm font-medium">Name</label>
              <input required name="name" className="w-full mt-1 px-3 py-2 border rounded" placeholder="Your full name" />
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <input required name="phone" className="w-full mt-1 px-3 py-2 border rounded" placeholder="Mobile number" />
            </div>

            <div>
              <label className="text-sm font-medium">Email (optional)</label>
              <input name="email" type="email" className="w-full mt-1 px-3 py-2 border rounded" placeholder="you@example.com" />
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea required name="message" rows={5} className="w-full mt-1 px-3 py-2 border rounded" placeholder="Tell us about your project, measurements or questions" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>

              <button type="button" onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Page URL copied to clipboard'); }} className="text-sm text-slate-600 underline">
                Share this page
              </button>
            </div>

            {message && (
              <div className={`mt-2 p-3 rounded ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {message.text}
              </div>
            )}

            <div className="text-xs text-slate-400 mt-2">By sending you agree to our terms and privacy policy.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
