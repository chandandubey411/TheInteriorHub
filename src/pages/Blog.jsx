// src/pages/Blog.jsx
import React from "react";

const VIDEOS = [
  { id: 1, src: "/videos/vid3.MP4", title: "Modular Kitchen Walkthrough" },
  { id: 2, src: "/videos/vid5.MP4", title: "Luxury Wall Panel Design" },
  { id: 3, src: "/videos/vid1.MP4", title: "Home Interior Transformation" },
  { id: 4, src: "/videos/vid2.MP4", title: "Flat Renovation Progress" },
  { id: 5, src: "/videos/vid4.MP4", title: "Finished Interior Showcase" },
];

export default function Blog() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
          Project Videos & Walkthroughs
        </h1>
        <p className="mt-3 text-slate-500">
          Explore our real project videos — modular kitchens, interiors,
          renovations & premium finishes.
        </p>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEOS.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            {/* Video */}
            <video
              src={video.src}
              controls
              preload="metadata"
              className="w-full h-[450px] object-cover bg-black"
            />

            {/* Caption */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-800">
                {video.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Watch complete design & execution
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
