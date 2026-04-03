import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";

const EMOTION_SERVICE_URL = process.env.EMOTION_SERVICE_URL || "http://127.0.0.1:8001";
const EMOTION_AUTO_START = String(process.env.EMOTION_AUTO_START || "true").toLowerCase() !== "false";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emotionServiceDir = path.resolve(__dirname, "..", "..", "..", "services", "emotion-service");
let emotionServiceProcess = null;
let emotionServiceStartPromise = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const stdoutLogPath = path.join(emotionServiceDir, "emotion-service.out.log");
const stderrLogPath = path.join(emotionServiceDir, "emotion-service.err.log");

const isEmotionServiceHealthy = async () => {
  try {
    const response = await fetch(`${EMOTION_SERVICE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

const getPythonCommandCandidates = () => {
  const configured = String(process.env.PYTHON_BIN || "").trim();
  const candidates = [];

  if (configured) {
    candidates.push({ command: configured, args: ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001"] });
  }

  candidates.push(
    { command: "python", args: ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001"] },
    { command: "py", args: ["-3", "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001"] },
    { command: "py", args: ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001"] }
  );

  return candidates;
};

const spawnEmotionService = async () => {
  const stdout = fs.createWriteStream(stdoutLogPath, { flags: "a" });
  const stderr = fs.createWriteStream(stderrLogPath, { flags: "a" });

  for (const candidate of getPythonCommandCandidates()) {
    const child = spawn(candidate.command, candidate.args, {
      cwd: emotionServiceDir,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });

    child.stdout?.pipe(stdout, { end: false });
    child.stderr?.pipe(stderr, { end: false });

    const started = await new Promise((resolve) => {
      let settled = false;

      const finish = (value) => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      };

      child.once("spawn", () => finish(true));
      child.once("error", () => finish(false));
      child.once("exit", () => finish(false));
      setTimeout(() => finish(true), 400);
    });

    if (started) {
      return child;
    }
  }

  return null;
};

const ensureEmotionService = async () => {
  if (await isEmotionServiceHealthy()) {
    return true;
  }

  if (!EMOTION_AUTO_START) {
    return false;
  }

  if (emotionServiceStartPromise) {
    return emotionServiceStartPromise;
  }

  emotionServiceStartPromise = (async () => {
    if (!emotionServiceProcess || emotionServiceProcess.killed) {
      emotionServiceProcess = await spawnEmotionService();
    }

    for (let attempt = 0; attempt < 35; attempt += 1) {
      await sleep(1000);

      if (await isEmotionServiceHealthy()) {
        return true;
      }
    }

    return false;
  })();

  try {
    return await emotionServiceStartPromise;
  } finally {
    emotionServiceStartPromise = null;
  }
};

export const detectEmotionViaService = async ({ imageBase64 }) => {
  const isHealthy = await isEmotionServiceHealthy();
  if (!isHealthy) {
    const started = await ensureEmotionService();
    if (!started) {
      const error = new Error(
        `Unable to reach the emotion service at ${EMOTION_SERVICE_URL}. The backend could not start the Python emotion service automatically.`
      );
      error.status = 503;
      throw error;
    }
  }

  const form = new FormData();
  form.append("image_base64", imageBase64);

  let response;

  try {
    response = await fetch(`${EMOTION_SERVICE_URL}/detect-emotion`, {
      method: "POST",
      body: form
    });
  } catch {
    const started = await ensureEmotionService();

    if (started) {
      response = await fetch(`${EMOTION_SERVICE_URL}/detect-emotion`, {
        method: "POST",
        body: form
      });
    } else {
      const error = new Error(
        `Unable to reach the emotion service at ${EMOTION_SERVICE_URL}. The backend could not start the Python emotion service automatically.`
      );
      error.status = 503;
      throw error;
    }
  }

  if (!response) {
    const error = new Error(
      `Unable to reach the emotion service at ${EMOTION_SERVICE_URL}. The backend could not start the Python emotion service automatically.`
    );
    error.status = 503;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.detail || data?.message || "Emotion detection failed.";
    const error = new Error(message);
    error.status = response.status || 502;
    throw error;
  }

  return data;
};
