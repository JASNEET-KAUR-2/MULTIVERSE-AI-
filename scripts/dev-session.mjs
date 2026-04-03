import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import net from "net";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const ports = {
  mongo: Number(process.env.MONGO_PORT || 27017),
  ml: Number(process.env.ML_PORT || 8001),
  backend: Number(process.env.BACKEND_PORT || 5050),
  frontend: Number(process.env.FRONTEND_PORT || 5174)
};

const logDir = path.join(rootDir, ".logs");
const mongoDataDir = path.join(rootDir, ".mongo-data");
const mongoLogPath = path.join(logDir, "mongod-session.log");

const children = [];

const isWindows = process.platform === "win32";
const pythonCommand = process.env.PYTHON_CMD || "python";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkTcpPort = (port, host = "127.0.0.1", timeoutMs = 800) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });

const waitForTcpPort = async (port, label, retries = 40, delayMs = 500) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (await checkTcpPort(port)) {
      console.log(`[ready] ${label} on port ${port}`);
      return true;
    }
    await wait(delayMs);
  }

  throw new Error(`${label} did not become ready on port ${port}.`);
};

const waitForHttp = async (url, label, retries = 40, delayMs = 750) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`[ready] ${label} at ${url}`);
        return true;
      }
    } catch {}

    await wait(delayMs);
  }

  throw new Error(`${label} did not respond at ${url}.`);
};

const resolveMongodPath = () => {
  const candidates = [
    process.env.MONGOD_PATH,
    "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe"
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const startChild = ({ label, command, args, cwd, env, stdio = "inherit" }) => {
  console.log(`[start] ${label}`);
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio,
    shell: false
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[exit] ${label} stopped by signal ${signal}`);
      return;
    }

    if (code !== 0) {
      console.log(`[exit] ${label} exited with code ${code}`);
    }
  });

  children.push({ label, child });
  return child;
};

const stopAll = () => {
  for (const { child } of children.reverse()) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }
};

process.on("SIGINT", () => {
  console.log("\n[stop] Shutting down dev session...");
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});

const run = async () => {
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(mongoDataDir, { recursive: true });

  const mongoUrl = `mongodb://127.0.0.1:${ports.mongo}/parallel-you`;
  const mlUrl = `http://127.0.0.1:${ports.ml}`;
  const backendUrl = `http://127.0.0.1:${ports.backend}`;
  const frontendUrl = `http://localhost:${ports.frontend}`;

  if (!(await checkTcpPort(ports.mongo))) {
    const mongodPath = resolveMongodPath();
    if (!mongodPath) {
      throw new Error("MongoDB is not listening and mongod.exe was not found. Set MONGOD_PATH or start MongoDB manually.");
    }

    startChild({
      label: "mongo",
      command: mongodPath,
      args: ["--dbpath", mongoDataDir, "--logpath", mongoLogPath, "--bind_ip", "127.0.0.1", "--port", String(ports.mongo)],
      cwd: rootDir
    });

    await waitForTcpPort(ports.mongo, "MongoDB");
  } else {
    console.log(`[ready] Reusing MongoDB on port ${ports.mongo}`);
  }

  startChild({
    label: "ml",
    command: pythonCommand,
    args: [
      "-c",
      `from app import app; app.run(host="127.0.0.1", port=${ports.ml}, debug=False)`
    ],
    cwd: path.join(rootDir, "ml-model")
  });
  await waitForHttp(`${mlUrl}/health`, "ML service");

  startChild({
    label: "backend",
    command: "node",
    args: ["server.js"],
    cwd: path.join(rootDir, "backend"),
    env: {
      PORT: String(ports.backend),
      CLIENT_URL: frontendUrl,
      ML_API_URL: mlUrl,
      MONGODB_URI: mongoUrl
    }
  });
  await waitForHttp(`${backendUrl}/api/health`, "Backend");

  startChild({
    label: "frontend",
    command: isWindows ? "cmd.exe" : "npm",
    args: isWindows
      ? ["/c", `npm run dev -- --host 0.0.0.0 --port ${ports.frontend}`]
      : ["run", "dev", "--", "--host", "0.0.0.0", "--port", String(ports.frontend)],
    cwd: path.join(rootDir, "frontend"),
    env: {
      VITE_API_URL: `${backendUrl}/api`
    }
  });
  await waitForHttp(frontendUrl, "Frontend");

  console.log("\nDev session is running:");
  console.log(`Frontend: ${frontendUrl}`);
  console.log(`Backend:  ${backendUrl}/api/health`);
  console.log(`ML API:   ${mlUrl}/health`);
  console.log("\nPress Ctrl+C to stop all services.");
};

run().catch((error) => {
  console.error(`[error] ${error.message}`);
  stopAll();
  process.exit(1);
});
