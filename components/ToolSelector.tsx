"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

export type Tool = "remove-bg" | "convert" | "cv-photo";

const TOOLS: { id: Tool; title: string; desc: string; icon: string }[] = [
  { id: "remove-bg", title: "Background Remover", desc: "Transparent, white, blue or custom backgrounds", icon: "✂️" },
  { id: "convert", title: "Image Converter", desc: "PNG, JPG & WebP — resize, crop, compress", icon: "🔄" },
  { id: "cv-photo", title: "CV Photo Maker", desc: "Professional suit & studio background", icon: "👔" }
];

export default function ToolSelector({ active, onSelect }: { active: Tool; onSelect: (t: Tool) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {TOOLS.map((tool, i) => (
        <motion.button
          key={tool.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(tool.id)}
          className={clsx(
            "glass rounded-2xl p-5 text-left transition-all hover:border-accent/40",
            active === tool.id && "border-accent/60 shadow-glow bg-accent/5"
          )}
        >
          <div className="text-2xl mb-2">{tool.icon}</div>
          <div className="font-semibold text-white">{tool.title}</div>
          <div className="text-sm text-white/50 mt-1">{tool.desc}</div>
        </motion.button>
      ))}
    </div>
  );
}
