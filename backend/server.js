import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const port = process.env.PORT || 5000;

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "ML_API_URL", "GROQ_API_KEY"];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const startServer = async () => {
  const [{ default: app }, { default: connectDatabase }] = await Promise.all([
    import("./src/app.js"),
    import("./src/config/db.js")
  ]);

  validateEnv();
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Parallel You backend running on port ${port}`);
  });
};
startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
