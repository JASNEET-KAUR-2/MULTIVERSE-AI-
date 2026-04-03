import { useEffect, useMemo, useRef, useState } from "react";

const ENABLED_KEY = "parallel-you-ambient-enabled";
const VOLUME_KEY = "parallel-you-ambient-volume";
const REVERB_KEY = "parallel-you-ambient-reverb";
const AUDIO_SRC = "/assets/audio/multiverse.mp3";
const DEFAULT_VOLUME = 0.28;
const FADE_IN_SECONDS = 2.4;
const FADE_OUT_SECONDS = 1.1;
const SCROLL_VOLUME_BOOST = 0.08;
const SCROLL_RATE_BOOST = 0.05;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildImpulseResponse = (context, duration = 2.4, decay = 2.1) => {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const impulse = context.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const n = length - i;
      channelData[i] = ((Math.random() * 2) - 1) * (n / length) ** decay;
    }
  }

  return impulse;
};

const BackgroundAudioController = () => {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem(ENABLED_KEY);
    return saved === null ? true : saved === "true";
  });
  const [volume, setVolume] = useState(() => {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(saved) ? clamp(saved, 0, 1) : DEFAULT_VOLUME;
  });
  const [reverbEnabled, setReverbEnabled] = useState(() => {
    const saved = localStorage.getItem(REVERB_KEY);
    return saved === null ? true : saved === "true";
  });
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [interactionNeeded, setInteractionNeeded] = useState(false);
  const [message, setMessage] = useState("Ambient ready");
  const [scrollDepth, setScrollDepth] = useState(0);

  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);
  const convolverRef = useRef(null);
  const wetGainRef = useRef(null);
  const setupPromiseRef = useRef(null);

  const volumePercent = useMemo(() => Math.round(volume * 100), [volume]);
  const effectiveVolume = useMemo(
    () => clamp(volume + (scrollDepth * SCROLL_VOLUME_BOOST), 0.02, 0.45),
    [scrollDepth, volume]
  );

  const ensureAudioEngine = async () => {
    if (setupPromiseRef.current) {
      return setupPromiseRef.current;
    }

    setupPromiseRef.current = (async () => {
      const audio = audioRef.current;
      if (!audio) {
        return null;
      }

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        setMessage("Audio unsupported");
        return null;
      }

      const context = new AudioContextClass();
      const source = context.createMediaElementSource(audio);
      const gainNode = context.createGain();
      const convolver = context.createConvolver();
      const wetGain = context.createGain();

      convolver.buffer = buildImpulseResponse(context);
      wetGain.gain.value = reverbEnabled ? 0.14 : 0;
      gainNode.gain.value = 0.0001;

      source.connect(gainNode);
      gainNode.connect(context.destination);
      source.connect(convolver);
      convolver.connect(wetGain);
      wetGain.connect(context.destination);

      contextRef.current = context;
      sourceRef.current = source;
      gainRef.current = gainNode;
      convolverRef.current = convolver;
      wetGainRef.current = wetGain;

      return context;
    })();

    return setupPromiseRef.current;
  };

  const fadeMasterGain = (target, durationSeconds) => {
    const context = contextRef.current;
    const gainNode = gainRef.current;
    if (!context || !gainNode) {
      return;
    }

    const now = context.currentTime;
    const currentValue = gainNode.gain.value;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(currentValue, now);
    gainNode.gain.linearRampToValueAtTime(Math.max(target, 0.0001), now + durationSeconds);
  };

  const syncReverb = () => {
    const wetGain = wetGainRef.current;
    const context = contextRef.current;
    if (!wetGain || !context) {
      return;
    }

    const now = context.currentTime;
    wetGain.gain.cancelScheduledValues(now);
    wetGain.gain.setValueAtTime(wetGain.gain.value, now);
    wetGain.gain.linearRampToValueAtTime(reverbEnabled ? 0.14 : 0, now + 0.4);
  };

  const tryPlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const context = await ensureAudioEngine();
    if (!context) {
      return;
    }

    try {
      await context.resume();
      audio.loop = true;
      audio.preload = "auto";
      audio.playbackRate = 1 + (scrollDepth * SCROLL_RATE_BOOST);
      await audio.play();
      fadeMasterGain(effectiveVolume, FADE_IN_SECONDS);
      syncReverb();
      setReady(true);
      setInteractionNeeded(false);
      setMessage(`Ambient on ${Math.round(effectiveVolume * 100)}%`);
    } catch {
      setInteractionNeeded(true);
      setReady(false);
      setMessage("Tap to start audio");
    }
  };

  const pauseAudio = (fadeSeconds = FADE_OUT_SECONDS) => {
    const audio = audioRef.current;
    const context = contextRef.current;
    if (!audio) {
      return;
    }

    if (!context || !gainRef.current) {
      audio.pause();
      setReady(false);
      setMessage("Ambient off");
      return;
    }

    fadeMasterGain(0.0001, fadeSeconds);
    window.setTimeout(() => {
      audio.pause();
    }, fadeSeconds * 1000);
    setReady(false);
    setMessage("Ambient off");
  };

  useEffect(() => {
    localStorage.setItem(ENABLED_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, String(volume));
    if (ready) {
      fadeMasterGain(effectiveVolume, 0.4);
      setMessage(`Ambient on ${Math.round(effectiveVolume * 100)}%`);
    }
  }, [effectiveVolume, ready, volume]);

  useEffect(() => {
    localStorage.setItem(REVERB_KEY, String(reverbEnabled));
    syncReverb();
  }, [reverbEnabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.playbackRate = 1 + (scrollDepth * SCROLL_RATE_BOOST);
    if (ready) {
      fadeMasterGain(effectiveVolume, 0.45);
    }
  }, [effectiveVolume, ready, scrollDepth]);

  useEffect(() => {
    const boot = async () => {
      if (enabled) {
        await tryPlay();
      } else {
        pauseAudio(0.2);
      }
    };

    boot();
  }, [enabled]);

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (enabled && interactionNeeded) {
        await tryPlay();
      }
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { passive: true });
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [enabled, interactionNeeded]);

  useEffect(() => {
    const handlePageHide = () => {
      if (enabled) {
        pauseAudio(0.35);
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [enabled]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
      setScrollDepth(depth);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
      contextRef.current?.close().catch(() => {});
    },
    []
  );

  const handleToggle = async () => {
    if (enabled) {
      setEnabled(false);
      pauseAudio();
      return;
    }

    setEnabled(true);
    await tryPlay();
  };

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" hidden />

      <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
        {expanded ? (
          <div className="fixed inset-0 z-[89] flex items-end justify-end bg-slate-950/18 p-5 backdrop-blur-[2px] sm:items-center">
            <div
              className="glass-light w-full max-w-sm rounded-[1.75rem] border border-cyan-200/30 p-5 text-slate-800 shadow-[0_28px_80px_rgba(15,23,42,0.22)]"
              role="dialog"
              aria-modal="true"
              aria-label="Ambient audio settings"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ambient Audio</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Multiverse sound design</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded-full border border-cyan-200/50 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume</span>
                    <span className="text-sm font-medium text-cyan-700">{volumePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(event) => setVolume(clamp(Number(event.target.value), 0, 1))}
                    className="w-full accent-cyan-300"
                    aria-label="Ambient volume"
                  />
                </div>

                <label className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-200/40 bg-white/50 px-4 py-3 text-sm text-slate-700">
                  <span>Spatial reverb</span>
                  <input
                    type="checkbox"
                    checked={reverbEnabled}
                    onChange={() => setReverbEnabled((current) => !current)}
                    className="h-4 w-4 accent-cyan-400"
                    aria-label="Toggle subtle reverb"
                  />
                </label>

                <div className="rounded-2xl border border-cyan-200/40 bg-white/50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Scroll intensity sync</span>
                    <span className="font-medium text-cyan-700">{Math.round(scrollDepth * 100)}%</span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    As users move deeper into the experience, the ambient layer subtly grows in presence and playback energy.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="absolute inset-0 -z-10 cursor-default"
              aria-label="Close ambient audio settings"
              onClick={() => setExpanded(false)}
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="ambient-toggle glass-light rounded-full px-3 py-3 text-xs text-slate-700 transition hover:bg-white/90"
            aria-label="Open ambient audio settings"
          >
            FX
          </button>

          <button
            type="button"
            onClick={handleToggle}
            className="ambient-toggle glass-light inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm text-slate-800 transition hover:bg-white/90"
            aria-pressed={enabled}
            aria-label={enabled ? "Mute ambient audio" : "Unmute ambient audio"}
            title={enabled ? "Mute ambient audio" : "Unmute ambient audio"}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${enabled && ready ? "bg-emerald-500" : "bg-slate-400"}`} />
            <span aria-hidden="true">{enabled ? "🔊" : "🔇"}</span>
            <span>{enabled ? (interactionNeeded ? "Tap to enable audio" : message) : "Ambient off"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BackgroundAudioController;
