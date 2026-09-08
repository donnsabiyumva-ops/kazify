import { useState } from "react";
import Icon from "./Icon.jsx";

export default function ReelPlayer({ reel, onClose }) {
  const [slide, setSlide] = useState(0);
  if (!reel) return null;

  const slides = reel.mediaType === "slideshow" ? reel.slideUrls ?? [] : [];
  const isSlideshow = slides.length > 0;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(8,13,25,0.92)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ position: "relative", width: "min(92vw,380px)", aspectRatio: "9 / 16", borderRadius: 18, overflow: "hidden", background: "#000" }}
        onClick={(e) => e.stopPropagation()}
      >
        {isSlideshow ? (
          <>
            <img src={slides[slide]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {slides.length > 1 && (
              <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", gap: 4, zIndex: 3 }}>
                {slides.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= slide ? "#fff" : "rgba(255,255,255,0.35)" }} />
                ))}
              </div>
            )}
            {slide > 0 && (
              <button
                onClick={() => setSlide((s) => s - 1)}
                aria-label="Previous"
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 3 }}
              >
                <Icon icon="chevron-left" size={18} />
              </button>
            )}
            {slide < slides.length - 1 && (
              <button
                onClick={() => setSlide((s) => s + 1)}
                aria-label="Next"
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 3 }}
              >
                <Icon icon="chevron-right" size={18} />
              </button>
            )}
          </>
        ) : (
          reel.videoUrl && (
            <video src={reel.videoUrl} controls autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        )}

        <button
          onClick={onClose}
          style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
        >
          <Icon icon="x" size={16} />
        </button>

        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: isSlideshow ? 16 : 12,
            fontSize: 12.5,
            fontWeight: 600,
            color: "#fff",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        >
          {reel.title}
        </div>
      </div>
    </div>
  );
}
