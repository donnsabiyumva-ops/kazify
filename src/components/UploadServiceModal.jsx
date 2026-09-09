import { useState } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default function UploadServiceModal() {
  const { state, setState, categoriesData, createService, say, accent } = useKazify();
  const [mediaType, setMediaType] = useState("video");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [categoryId, setCategoryId] = useState("");
  const [busy, setBusy] = useState(false);

  if (!state.uploadOpen) return null;

  const close = () => setState((prev) => ({ ...prev, uploadOpen: false }));

  const pickVideo = (f) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      say("Please choose a video file");
      return;
    }
    if (f.size > MAX_VIDEO_BYTES) {
      say("That video is too large — try one under 80MB");
      return;
    }
    setFile(f);
  };

  const pickPhotos = (list) => {
    const picked = Array.from(list || []);
    if (picked.some((f) => !f.type.startsWith("image/"))) {
      say("Please choose image files");
      return;
    }
    if (picked.some((f) => f.size > MAX_IMAGE_BYTES)) {
      say("One of those photos is too large — try under 8MB each");
      return;
    }
    setFiles(picked);
  };

  const valid =
    title.trim().length > 2 &&
    Number(price) > 0 &&
    Number(deliveryDays) > 0 &&
    !!categoryId &&
    (mediaType === "video" ? !!file : files.length > 0);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const ok = await createService({
      title: title.trim(),
      price: Number(price),
      deliveryDays: Number(deliveryDays),
      categoryId,
      mediaType,
      file,
      files,
    });
    setBusy(false);
    if (ok) {
      setFile(null);
      setFiles([]);
      setTitle("");
      setPrice("");
      setDeliveryDays("3");
      setCategoryId("");
    }
  };

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 88, animation: "kz-fade .18s ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 440, maxHeight: "88vh", overflowY: "auto", background: "var(--kz-bg)", borderRadius: 18, boxShadow: "0 24px 60px var(--kz-shadow)", animation: "kz-rise .22s ease-out" }}
      >
        <div style={{ padding: "20px 22px 4px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#059669", textTransform: "uppercase" }}>New service</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Post a service</div>
          </div>
          <button onClick={close} style={{ flex: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--kz-surface-2)", borderRadius: 8, color: "var(--kz-text-muted)" }}>
            <Icon icon="x" size={15} />
          </button>
        </div>

        <div style={{ padding: "10px 22px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "video", label: "Video clip", icon: "video" },
              { key: "slideshow", label: "Photos", icon: "image" },
            ].map((m) => {
              const active = mediaType === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMediaType(m.key)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: active ? "var(--kz-accent-soft)" : "var(--kz-surface-2)", color: active ? "var(--kz-accent-text)" : "var(--kz-text-secondary)", boxShadow: active ? "inset 0 0 0 1.5px " + accent : "none" }}
                >
                  <Icon icon={m.icon} size={15} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {mediaType === "video" ? (
            <label style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 14px", background: "var(--kz-surface)", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "var(--kz-text)", cursor: "pointer", boxShadow: "inset 0 0 0 1px var(--kz-border)" }}>
              <Icon icon="video" size={16} />
              {file ? file.name : "Choose a 9:16 video clip"}
              <input type="file" accept="video/*" onChange={(e) => pickVideo(e.target.files?.[0])} style={{ display: "none" }} />
            </label>
          ) : (
            <label style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 14px", background: "var(--kz-surface)", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "var(--kz-text)", cursor: "pointer", boxShadow: "inset 0 0 0 1px var(--kz-border)" }}>
              <Icon icon="image-up" size={16} />
              {files.length ? `${files.length} photo${files.length > 1 ? "s" : ""} chosen` : "Choose photos"}
              <input type="file" accept="image/*" multiple onChange={(e) => pickPhotos(e.target.files)} style={{ display: "none" }} />
            </label>
          )}

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--kz-text-muted)" }}>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will edit a 60s vertical video with captions" style={fieldStyle} />
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--kz-text-muted)" }}>Price (UGX)</span>
              <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="150000" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono',monospace" }} />
            </label>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--kz-text-muted)" }}>Delivery (days)</span>
              <input value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value.replace(/\D/g, ""))} placeholder="3" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono',monospace" }} />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--kz-text-muted)" }}>Category</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categoriesData.map((c) => {
                const active = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    style={{ padding: "9px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: active ? "var(--kz-accent-soft)" : "var(--kz-surface-2)", color: active ? "var(--kz-accent-text)" : "var(--kz-text-secondary)", boxShadow: active ? "inset 0 0 0 1.5px " + accent : "none" }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={!valid || busy}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              height: 50,
              borderRadius: 13,
              fontSize: 14,
              fontWeight: 700,
              background: valid ? accent : "var(--kz-border)",
              color: valid ? "#fff" : "var(--kz-text-faint)",
              boxShadow: valid ? "0 8px 20px rgba(5,150,105,0.24)" : "none",
              opacity: busy ? 0.7 : 1,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? "Posting…" : "Post service"}
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  fontSize: 13,
  color: "var(--kz-text)",
  background: "var(--kz-surface-2)",
  border: "none",
  borderRadius: 10,
  outline: "none",
};
