"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";

export default function Uploader({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <motion.label
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`glass flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
        ${dragging ? "border-accent bg-accent/5" : "border-white/10"}
        px-8 py-16 text-center cursor-pointer transition-colors`}
    >
      <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-accent-soft">
          <path d="M12 16V4M12 4l-5 5M12 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-white/90 font-medium">Drag & drop an image, or click to browse</p>
      <p className="text-white/40 text-sm">PNG, JPG or WebP — up to 10MB</p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.label>
  );
}
