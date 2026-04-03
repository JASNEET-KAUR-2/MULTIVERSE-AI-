import { useEffect, useRef, useState } from "react";

const ENABLED_KEY = "parallel-you-ambient-enabled";
const VOLUME_KEY = "parallel-you-ambient-volume";

const createVoice = (context, destination, { frequency, gain, type = "sine" }) => {
  const oscillator = context.createOscillator();
  const voiceGain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  filter.type = "lowpass";
  filter.frequency.value = 1350;
  voiceGain.gain.value = gain;

  oscillator.connect(filter);
  filter.connect(voiceGain);
  voiceGain.connect(destination);
  oscillator.start();

  return { oscillator, voiceGain };
};

const BackgroundAudioController = () => {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem(ENABLED_KEY);
    return saved === null ? true : saved === "true";
  });
  const [volume, setVolume] = useState(() => {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : 72;
  });
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Ambient On");
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);

  const targetGain = Math.max(0.02, volume / 1000);

  const createEngine = async () => {
    if (audioRef.current) {
      return audioRef.current;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setMessage("Audio unsupported");
      return null;
    }

    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.0001;
    master.connect(context.destination);

    const padA = createVoice(context, master, { frequency: 196, gain: 0.28, type: "sine" });
    const padB = createVoice(context, master, { frequency: 246.94, gain: 0.18, type: "triangle" });
    const padC = createVoice(context, master, { frequency: 293.66, gain: 0.12, type: "sine" });
    const padD = createVoice(context, master, { frequency: 392, gain: 0.05, type: "triangle" });

    const shimmer = context.createOscillator();
    const shimmerGain = context.createGain();
    const shimmerFilter = context.createBiquadFilter();
    shimmer.type = "triangle";
    shimmer.frequency.value = 587.33;
    shimmerFilter.type = "lowpass";
    shimmerFilter.frequency.value = 1700;
    shimmerGain.gain.value = 0.02;
    shimmer.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(master);
    shimmer.start();

    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.028;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();

    audioRef.current = {
      context,
      master,
      nodes: [padA, padB, padC, padD, { oscillator: shimmer, voiceGain: shimmerGain }, { oscillator: lfo }]
    };

    return audioRef.current;
  };

  const resumeAmbient = async () => {
    const audio = await createEngine();
    if (!audio) {
      return;
    }

    try {
      await audio.context.resume();
      audio.master.gain.cancelScheduledValues(audio.context.currentTime);
      audio.master.gain.setTargetAtTime(targetGain, audio.context.currentTime, 0.7);
      setReady(true);
      setMessage("Ambient On");
    } catch {
      setMessage("Tap again");
    }
  };

  const pauseAmbient = () => {
    const audio = audioRef.current;
    if (!audio) {
      setReady(false);
      setMessage("Ambient Off");
      return;
    }

    audio.master.gain.cancelScheduledValues(audio.context.currentTime);
    audio.master.gain.setTargetAtTime(0.0001, audio.context.currentTime, 0.35);
    setReady(false);
    setMessage("Ambient Off");
  };

  useEffect(() => {
    localStorage.setItem(ENABLED_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !enabled) {
      return;
    }

    audio.master.gain.cancelScheduledValues(audio.context.currentTime);
    audio.master.gain.setTargetAtTime(targetGain, audio.context.currentTime, 0.4);
  }, [volume, enabled, targetGain]);

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (enabled) {
        await resumeAmbient();
      }
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    if (!enabled) {
      pauseAmbient();
    }

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [enabled]);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      audio.nodes.forEach(({ oscillator, voiceGain }) => {
        try {
          voiceGain?.disconnect();
          oscillator.disconnect();
          oscillator.stop();
        } catch {}
      });
      audio.master.disconnect();
      audio.context.close().catch(() => {});
    },
    []
  );

  const handleToggle = async () => {
    if (enabled) {
      setEnabled(false);
      pauseAmbient();
      return;
    }

    setEnabled(true);
    await resumeAmbient();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      {expanded ? (
        <div className="glass-light rounded-2xl border border-cyan-200/30 px-4 py-3 text-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-32 accent-cyan-300"
            />
            <span className="w-10 text-right text-sm text-cyan-700">{volume}%</span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="ambient-toggle glass-light rounded-full px-3 py-3 text-xs text-slate-700 transition hover:bg-white/90"
          aria-label="Adjust ambient volume"
        >
          Vol
        </button>
        <button
          type="button"
          onClick={handleToggle}
          className="ambient-toggle glass-light inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm text-slate-800 transition hover:bg-white/90"
          aria-pressed={enabled}
          aria-label={enabled ? "Pause background music" : "Play background music"}
          title={enabled ? "Pause background music" : "Play background music"}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
          <span>{enabled ? (ready ? `${message} ${volume}%` : "Tap to enable audio") : "Ambient Off"}</span>
        </button>
      </div>
    </div>
  );
};

export default BackgroundAudioController;
