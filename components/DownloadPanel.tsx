"use client";

export default function DownloadPanel({
  url,
  filename,
  onReset
}: {
  url: string;
  filename: string;
  onReset: () => void;
}) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-white font-medium">Ready to download</p>
        <p className="text-white/40 text-sm">{filename}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onReset} className="btn-secondary">
          Start over
        </button>
        <a href={url} download={filename} className="btn-primary">
          Download
        </a>
      </div>
    </div>
  );
}
