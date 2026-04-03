import path from "path";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const port = process.env.PORT || 5000;
const emotionServiceUrl = process.env.EMOTION_SERVICE_URL || "http://127.0.0.1:8001";
const emotionAutoStart = String(process.env.EMOTION_AUTO_START || "true").toLowerCase() !== "false";
const emotionServiceDir = path.resolve(__dirname, "..", "services", "emotion-service");
let emotionServiceProcess = null;
let emotionServiceStartPromise = null;
const emotionStdoutLogPath = path.join(emotionServiceDir, "emotion-service.out.log");
const emotionStderrLogPath = path.join(emotionServiceDir, "emotion-service.err.log");

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "ML_API_URL", "GROQ_API_KEY"];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isEmotionServiceHealthy = async () => {
  try {
    const response = await fetch(`${emotionServiceUrl}/health`);
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
  const stdout = fs.createWriteStream(emotionStdoutLogPath, { flags: "a" });
  const stderr = fs.createWriteStream(emotionStderrLogPath, { flags: "a" });

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
    return;
  }

  if (!emotionAutoStart) {
    console.warn(`Emotion service is unavailable at ${emotionServiceUrl}.`);
    return;
  }

  console.log(`Emotion service not reachable at ${emotionServiceUrl}. Attempting to start it...`);

  if (emotionServiceStartPromise) {
    await emotionServiceStartPromise;
    return;
  }

  emotionServiceStartPromise = (async () => {
    emotionServiceProcess = await spawnEmotionService();

    if (!emotionServiceProcess) {
      console.warn("Unable to auto-start the emotion service.");
      return;
    }

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await sleep(1000);

      if (await isEmotionServiceHealthy()) {
        console.log(`Emotion service is ready at ${emotionServiceUrl}.`);
        return;
      }
    }

    console.warn(`Emotion service is still unavailable at ${emotionServiceUrl}. Check services/emotion-service/*.log for details.`);
  })();

  try {
    await emotionServiceStartPromise;
  } finally {
    emotionServiceStartPromise = null;
  }
};

const warmEmotionService = () => {
  ensureEmotionService().catch((error) => {
    console.warn("Emotion service warm-up failed.", error.message);
  });
};

const stopEmotionService = () => {
  if (emotionServiceProcess && !emotionServiceProcess.killed) {
    emotionServiceProcess.kill();
    emotionServiceProcess = null;
  }
};

process.on("exit", stopEmotionService);
process.on("SIGINT", () => {
  stopEmotionService();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopEmotionService();
  process.exit(0);
});

const startServer = async () => {
  const [{ default: app }, { default: connectDatabase }] = await Promise.all([
    import("./src/app.js"),
    import("./src/config/db.js")
  ]);

  validateEnv();
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Parallel You backend running on port ${port}`);
    warmEmotionService();
  });
};
startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
