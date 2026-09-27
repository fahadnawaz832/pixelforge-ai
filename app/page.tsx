"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ToolSelector, { Tool } from "@/components/ToolSelector";
import Uploader from "@/components/Uploader";
import ImageEditor from "@/components/ImageEditor";

export default function Home() {
  const [tool, setTool] = useState<Tool>("remove-bg");
  const [file, setFile] = useState<File | null>(null);

  return (
    <main className="max-w-5xl mx-auto px-6 py-14 flex flex-col gap-12">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center flex flex-col items-center gap-4"
      >
        <span className="text-xs tracking-widest uppercase text-accent-soft/80">AI Image Toolkit</span>
        <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight">
          PixelForge <span className="text-accent-soft">AI</span>
        </h1>
        <p className="text-white/50 max-w-lg">
          Remove backgrounds, convert formats and generate professional CV photos —
          fast, private and precise.
        </p>
      </motion.header>

      <ToolSelector active={tool} onSelect={(t) => { setTool(t); setFile(null); }} />

      {!file ? (
        <Uploader onFile={setFile} />
      ) : (
        <ImageEditor tool={tool} file={file} onReset={() => setFile(null)} />
      )}

      <footer className="text-center text-white/30 text-xs pt-8">
        Images are processed transiently and never stored.
      </footer>
    </main>
  );
}
