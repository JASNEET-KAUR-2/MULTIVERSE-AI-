import { useState } from "react";

const FutureSnapshotShare = ({ name, prediction, message, level }) => {
  const [status, setStatus] = useState("");

  const snapshot = `${name}'s multiverse ai Snapshot
Prediction: ${prediction}
Level: ${level}
Future Message: ${message}

Built with multiverse ai`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My multiverse ai Snapshot",
          text: snapshot
        });
        setStatus("Shared");
        return;
      }

      await navigator.clipboard.writeText(snapshot);
      setStatus("Copied");
    } catch {
      setStatus("Not shared");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Hackathon Snapshot</p>
          <p className="mt-2 text-sm text-slate-300">Share your future prediction and message in one tap.</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="gradient-brand rounded-xl px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Share Future Snapshot
        </button>
      </div>
      {status ? <p className="mt-3 text-xs text-cyan-300">{status}</p> : null}
    </div>
  );
};

export default FutureSnapshotShare;
