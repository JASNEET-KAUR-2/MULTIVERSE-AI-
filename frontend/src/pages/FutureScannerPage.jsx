import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { BrainIcon, SparklesIcon, TrendDownIcon, TrendUpIcon } from "../components/V0Icons.jsx";

const moods = [
  { id: "happy", label: "Happy" },
  { id: "focused", label: "Focused" },
  { id: "tired", label: "Tired" },
  { id: "stressed", label: "Stressed" }
];

const FutureScannerPage = () => {
  const { token, user, setUser } = useAuth();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [form, setForm] = useState({
    mood: "focused",
    energy: 6,
    engagement: 6,
    stress: 4
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [capturedAt, setCapturedAt] = useState(null);
  const [thumbnail, setThumbnail] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ xp: user?.xp || 0, scannerStreak: 0 });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    api
      .getDashboard(token)
      .then((dashboard) => {
        setHistory(dashboard.scannerHistory || []);
        setStats({
          xp: dashboard.stats?.xp || 0,
          scannerStreak: dashboard.stats?.scannerStreak || 0
        });
      })
      .catch(() => {});
  }, [token]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    []
  );

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
      setStreamError("");
    } catch {
      setStreamError("Camera access is blocked. You can still run the scanner manually.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  const captureState = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const maxWidth = 320;
      const sourceWidth = video.videoWidth || 640;
      const sourceHeight = video.videoHeight || 360;
      const scale = Math.min(1, maxWidth / sourceWidth);
      canvas.width = Math.max(160, Math.round(sourceWidth * scale));
      canvas.height = Math.max(120, Math.round(sourceHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumbnail(canvas.toDataURL("image/jpeg", 0.55));
    }

    setCapturedAt(new Date().toISOString());
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await api.futureSelfScan(token, {
        ...form,
        cameraEnabled,
        capturedAt,
        thumbnail
      });
      setResult(response);
      setHistory(response.scannerHistory || []);
      setStats((current) => ({
        ...current,
        xp: response.totalXp || current.xp,
        scannerStreak: response.scannerStreak || 0
      }));
      setUser((current) => (current ? { ...current, xp: response.totalXp || current.xp, scannerStreak: response.scannerStreak || 0 } : current));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Future Self Scanner</p>
            <h1 className="mt-3 text-4xl font-semibold">Scan your current state before it becomes your future.</h1>
            <p className="mt-4 max-w-3xl text-slate-300">
              Open your camera, mark your current mood and engagement, and let the app generate a short future warning plus the best move to recover momentum.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Scanner Streak</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">{stats.scannerStreak}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total XP</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">{stats.xp}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Live State Capture</p>
              <h2 className="mt-2 text-2xl font-semibold">Camera Assisted Scan</h2>
            </div>
            <UserAvatar name={user?.name} className="h-14 w-14 text-base" />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
            <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
            {!cameraEnabled ? (
              <div className="grid aspect-video place-items-center text-center text-slate-500">
                <div>
                  <BrainIcon className="mx-auto h-10 w-10 text-cyan-300" />
                  <p className="mt-3">Open camera to begin scanner mode.</p>
                </div>
              </div>
            ) : null}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {thumbnail ? (
            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Captured Snapshot</p>
              <img src={thumbnail} alt="Scanner capture" className="h-28 w-28 rounded-2xl border border-white/10 object-cover" />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            {!cameraEnabled ? (
              <button type="button" onClick={startCamera} className="gradient-brand rounded-xl px-4 py-3 font-semibold text-slate-950">
                Open Camera
              </button>
            ) : (
              <>
                <button type="button" onClick={captureState} className="gradient-brand rounded-xl px-4 py-3 font-semibold text-slate-950">
                  Capture Current State
                </button>
                <button type="button" onClick={stopCamera} className="rounded-xl border border-white/10 px-4 py-3 text-slate-300 hover:bg-white/5">
                  Stop Camera
                </button>
              </>
            )}
          </div>

          {capturedAt ? <p className="mt-3 text-sm text-cyan-300">State captured and ready for analysis.</p> : null}
          {streamError ? <p className="mt-3 text-sm text-amber-300">{streamError}</p> : null}
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Current State Inputs</p>
          <div className="mt-5 grid gap-5">
            <div>
              <p className="mb-3 text-sm text-slate-300">Mood</p>
              <div className="flex flex-wrap gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, mood: mood.id }))}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      form.mood === mood.id ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-300" : "border-white/10 text-slate-300"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { key: "energy", label: "Energy", accent: "text-emerald-300" },
              { key: "engagement", label: "Engagement", accent: "text-cyan-300" },
              { key: "stress", label: "Stress", accent: "text-pink-300" }
            ].map((item) => (
              <div key={item.key}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className={`text-sm font-medium ${item.accent}`}>{form[item.key]}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={form[item.key]}
                  onChange={(event) => setForm((current) => ({ ...current, [item.key]: Number(event.target.value) }))}
                  className="w-full accent-cyan-300"
                />
              </div>
            ))}

            <button type="button" onClick={handleSubmit} disabled={submitting} className="gradient-brand rounded-xl px-4 py-3 font-semibold text-slate-950">
              {submitting ? "Scanning Future..." : "Analyze Future Self"}
            </button>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </div>
        </div>
      </div>

      {result?.scan ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="glass rounded-2xl border border-emerald-300/30 p-6">
            <div className="mb-4 flex items-center gap-3">
              <TrendUpIcon className="h-6 w-6 text-emerald-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Scanner Verdict</p>
                <h2 className="text-2xl font-semibold text-emerald-300">{result.scan.statusLabel}</h2>
              </div>
            </div>
            <p className="text-slate-300">{result.scan.summary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Best Move Now</p>
                <p className="mt-2 text-slate-200">{result.scan.bestMoveNow}</p>
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Scanner Reward</p>
                <p className="mt-2 text-slate-200">+{result.xpAwarded} XP earned from today&apos;s scan</p>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Recovery Suggestions</p>
              <div className="mt-3 space-y-2">
                {result.scan.suggestions.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl border border-pink-300/30 p-6">
            <div className="mb-4 flex items-center gap-3">
              <TrendDownIcon className="h-6 w-6 text-pink-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Risk Outlook</p>
                <h2 className="text-2xl font-semibold text-pink-300">{result.riskLevel} Risk</h2>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">If This Pattern Continues</p>
              <p className="mt-2 text-slate-200">{result.scan.futureWarning}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Best Case</p>
                <p className="mt-2 text-sm text-slate-200">{result.scan.bestCase}</p>
              </div>
              <div className="rounded-2xl border border-pink-300/20 bg-pink-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-pink-300">Decline Case</p>
                <p className="mt-2 text-sm text-slate-200">{result.scan.declineCase}</p>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs text-cyan-300">
              <SparklesIcon className="h-4 w-4" />
              Scanner streak: {result.scannerStreak} day{result.scannerStreak === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      ) : null}

      <div className="glass rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Scan Timeline</p>
            <h2 className="mt-2 text-2xl font-semibold">Recent Scanner History</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {history.length} stored scans
          </div>
        </div>

        {history.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {history.map((scan) => (
              <div key={scan._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-4">
                  {scan.thumbnail ? (
                    <img src={scan.thumbnail} alt="Saved scanner snapshot" className="h-24 w-24 rounded-2xl object-cover" />
                  ) : (
                    <div className="grid h-24 w-24 place-items-center rounded-2xl border border-white/10 bg-slate-950/50 text-slate-500">
                      <BrainIcon className="h-8 w-8 text-cyan-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{scan.statusLabel}</p>
                      <span className={`rounded-full px-3 py-1 text-xs ${scan.riskLevel === "High" ? "bg-pink-300/10 text-pink-300" : scan.riskLevel === "Moderate" ? "bg-amber-300/10 text-amber-300" : "bg-emerald-300/10 text-emerald-300"}`}>
                        {scan.riskLevel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{scan.summary}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {new Date(scan.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            Your scanner history will appear here after the first scan.
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureScannerPage;
