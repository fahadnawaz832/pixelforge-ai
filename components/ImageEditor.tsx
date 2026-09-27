"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProcessingIndicator from "./ProcessingIndicator";
import DownloadPanel from "./DownloadPanel";
import type { Tool } from "./ToolSelector";

const BACKGROUNDS = [
  { id: "transparent", label: "Transparent", swatch: "conic-gradient(#333 0 25%, #555 0 50%, #333 0 75%, #555 0)" },
  { id: "white", label: "White", swatch: "#ffffff" },
  { id: "blue", label: "Blue", swatch: "#1e3a8a" },
  { id: "custom", label: "Custom", swatch: "#7c5cff" }
];

const SUIT_COLORS = ["charcoal", "navy", "black"];
const FORMATS = ["png", "jpg", "webp"] as const;

export default function ImageEditor({ tool, file, onReset }: { tool: Tool; file: File; onReset: () => void }) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  const [background, setBackground] = useState("white");
  const [customHex, setCustomHex] = useState("#7c5cff");
  const [suitColor, setSuitColor] = useState("charcoal");
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("png");
  const [quality, setQuality] = useState(85);

  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setStatus("processing");
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);

      let endpoint = "/api/convert";
      if (tool === "remove-bg") {
        endpoint = "/api/remove-bg";
        form.set("background", background);
        if (background === "custom") form.set("hex", customHex);
      } else if (tool === "cv-photo") {
        endpoint = "/api/cv-photo";
        form.set("suitColor", suitColor);
        form.set("background", background === "transparent" ? "white" : background);
        if (background === "custom") form.set("hex", customHex);
        form.set("aspect", "3:4");
      } else {
        form.set("format", format);
        form.set("quality", String(quality));
      }

      const res = await fetch(endpoint, { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Processing failed.");
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (e: any) {
      setError(e.message);
      setStatus("error");
    }
  }

  const outExt = tool === "convert" ? format : "png";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-4 flex items-center justify-center min-h-[320px]">
        {status === "done" && resultUrl ? (
          <img src={resultUrl} alt="Result" className="max-h-[420px] rounded-lg object-contain" />
        ) : (
          <img src={previewUrl} alt="Original" className="max-h-[420px] rounded-lg object-contain opacity-90" />
        )}
      </div>

      <div className="glass rounded-2xl p-6 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {status === "processing" ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessingIndicator label="Processing your image…" />
            </motion.div>
          ) : status === "done" && resultUrl ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DownloadPanel url={resultUrl} filename={`pixelforge.${outExt}`} onReset={onReset} />
            </motion.div>
          ) : (
            <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              {(tool === "remove-bg" || tool === "cv-photo") && (
                <div>
                  <p className="text-sm text-white/60 mb-2">Background</p>
                  <div className="flex gap-3 flex-wrap">
                    {BACKGROUNDS.filter((b) => tool === "cv-photo" ? b.id !== "transparent" : true).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBackground(b.id)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          background === b.id ? "border-accent" : "border-white/10"
                        }`}
                        style={{ background: b.swatch }}
                        title={b.label}
                      />
                    ))}
                  </div>
                  {background === "custom" && (
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="mt-3 w-16 h-8 bg-transparent"
                    />
                  )}
                </div>
              )}

              {tool === "cv-photo" && (
                <div>
                  <p className="text-sm text-white/60 mb-2">Suit color</p>
                  <div className="flex gap-2">
                    {SUIT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSuitColor(c)}
                        className={`px-4 py-2 rounded-xl text-sm capitalize ${
                          suitColor === c ? "bg-accent text-white" : "glass text-white/70"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool === "convert" && (
                <>
                  <div>
                    <p className="text-sm text-white/60 mb-2">Output format</p>
                    <div className="flex gap-2">
                      {FORMATS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`px-4 py-2 rounded-xl text-sm uppercase ${
                            format === f ? "bg-accent text-white" : "glass text-white/70"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-2">Quality: {quality}%</p>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                  </div>
                </>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 mt-auto">
                <button onClick={onReset} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={run} className="btn-primary flex-1">
                  Process image
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
