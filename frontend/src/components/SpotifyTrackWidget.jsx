import { useState } from "react";

const TRACK_ID = "0Uy1HmO5O5Xz031w6VUVvX";

const SpotifyTrackWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-5 z-[89] flex flex-col items-end gap-3">
      {open ? (
        <div className="glass w-[320px] overflow-hidden rounded-2xl border border-white/10 p-3 shadow-[0_20px_50px_rgba(2,6,23,0.38)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Spotify Calm Track</p>
              <p className="mt-1 text-sm text-slate-300">Play/stop from the Spotify widget</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
            >
              Close
            </button>
          </div>

          <iframe
            title="Spotify peaceful track"
            src={`https://open.spotify.com/embed/track/${TRACK_ID}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border-0"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="glass rounded-full border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900/80"
      >
        {open ? "Hide Spotify Track" : "Open Spotify Track"}
      </button>
    </div>
  );
};

export default SpotifyTrackWidget;
