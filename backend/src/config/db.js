import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const localMongoDataDir = path.join(rootDir, ".mongo-data");
const localMongoLogDir = path.join(rootDir, ".logs");
const localMongoLogPath = path.join(localMongoLogDir, "mongod-backend.log");
let connectionPromise = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isLocalMongoUri = (mongoUri) =>
  typeof mongoUri === "string" &&
  /^mongodb:\/\/(127\.0\.0\.1|localhost):27017\//.test(mongoUri);

const resolveMongodPath = () => {
  const candidates = [
    process.env.MONGOD_PATH,
    "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe"
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const waitForMongo = async (retries = 30, delayMs = 500) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const connection = await mongoose.createConnection("mongodb://127.0.0.1:27017/admin", {
        serverSelectionTimeoutMS: 1000
      }).asPromise();
      await connection.close();
      return true;
    } catch {
      await wait(delayMs);
    }
  }

  return false;
};

const ensureLocalMongoRunning = async () => {
  const mongodPath = resolveMongodPath();

  if (!mongodPath) {
    throw new Error(
      "MongoDB is not running on 127.0.0.1:27017 and mongod.exe was not found. Start MongoDB manually or set MONGOD_PATH."
    );
  }

  fs.mkdirSync(localMongoDataDir, { recursive: true });
  fs.mkdirSync(localMongoLogDir, { recursive: true });

  const child = spawn(
    mongodPath,
    ["--dbpath", localMongoDataDir, "--logpath", localMongoLogPath, "--bind_ip", "127.0.0.1", "--port", "27017"],
    {
      cwd: rootDir,
      detached: true,
      stdio: "ignore"
    }
  );

  child.unref();

  const ready = await waitForMongo();
  if (!ready) {
    throw new Error("Attempted to start local MongoDB, but it did not become ready on 127.0.0.1:27017.");
  }

  console.log("Started local MongoDB automatically on port 27017");
};

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB connected");
  } catch (error) {
    if (isLocalMongoUri(mongoUri) && error?.name === "MongooseServerSelectionError") {
      console.log("Local MongoDB was unavailable. Attempting to start it automatically...");
      await ensureLocalMongoRunning();
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log("MongoDB connected");
      return;
    }

    throw error;
  }
};

export const ensureDatabaseConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = connectDatabase().finally(() => {
      connectionPromise = null;
    });
  }

  return connectionPromise;
};

export default connectDatabase;
