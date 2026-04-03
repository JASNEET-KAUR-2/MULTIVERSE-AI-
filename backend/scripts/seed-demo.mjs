import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDatabase from "../src/config/db.js";
import Quest from "../src/models/Quest.js";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const demoUsers = [
  {
    name: "Disha",
    email: "disha.demo@parallelyou.dev",
    password: "demo1234",
    age: 19,
    goals: ["Become a prompt engineer", "Build meaningful products"],
    habits: ["coding", "late-night scrolling"],
    xp: 180,
    streak: 4,
    behaviorProfile: {
      studyHours: 6,
      sleepHours: 7,
      exercise: true,
      screenTime: 5,
      consistency: 7,
      procrastination: 4,
      goalClarity: 8
    },
    mlPrediction: {
      label: "High",
      probabilities: { High: 0.78, Average: 0.17, Negative: 0.05 },
      accuracy: 0.94
    },
    analysis: {
      strengths: ["High discipline", "Strong focus", "Creative problem solving"],
      weaknesses: ["Night-time screen drift", "Overcommitting", "Inconsistent recovery"],
      personalityType: "The Builder",
      modelUsed: "openai/gpt-oss-20b",
      summary: "A high-agency learner with strong execution when her environment supports her goals.",
      dailyTasks: [
        { title: "Deep work sprint", description: "Do one 45-minute session without distractions.", difficulty: "Easy" },
        { title: "Skill compounding", description: "Ship one tiny improvement to your current project.", difficulty: "Medium" }
      ]
    },
    simulation: {
      futureStory: "You compound your habits and become known for shipping thoughtful, high-leverage work.",
      alternateStory: "Without boundaries, your attention fragments and progress slows into frustration.",
      futureMessage: "Protect your focus. Your future is not blocked by talent, only by distraction."
    }
  },
  {
    name: "Alex",
    email: "alex.demo@parallelyou.dev",
    password: "demo1234",
    age: 24,
    goals: ["Lead a product team", "Build healthier routines"],
    habits: ["gym", "journaling"],
    xp: 260,
    streak: 7,
    behaviorProfile: {
      studyHours: 7,
      sleepHours: 7.5,
      exercise: true,
      screenTime: 4,
      consistency: 8,
      procrastination: 3,
      goalClarity: 9
    },
    mlPrediction: {
      label: "High",
      probabilities: { High: 0.84, Average: 0.12, Negative: 0.04 },
      accuracy: 0.94
    },
    analysis: {
      strengths: ["Leadership instincts", "Routine consistency", "Clear goals"],
      weaknesses: ["Occasional burnout", "Perfectionism"],
      personalityType: "The Warrior",
      modelUsed: "openai/gpt-oss-20b",
      summary: "A disciplined operator with strong upside and a need to guard against burnout.",
      dailyTasks: [
        { title: "Recovery block", description: "Take a deliberate 20-minute reset away from screens.", difficulty: "Easy" },
        { title: "Strategic outreach", description: "Message one person who can accelerate your future path.", difficulty: "Hard" }
      ]
    },
    simulation: {
      futureStory: "In five years, your consistency turns into influence, trust, and a strong professional reputation.",
      alternateStory: "If your recovery erodes, your output stays high but your joy and resilience fade.",
      futureMessage: "Intensity is only sustainable when it is paired with recovery."
    }
  }
];

const demoQuests = [
  { title: "Ship a tiny win", description: "Make one visible improvement to your project today.", difficulty: "Easy", xpReward: 20, completed: false },
  { title: "Focus lock", description: "Complete a 45-minute deep work block with notifications off.", difficulty: "Medium", xpReward: 35, completed: false },
  { title: "Future proofing", description: "Write down the three habits your future self refuses to compromise on.", difficulty: "Hard", xpReward: 60, completed: false }
];

const run = async () => {
  await connectDatabase();

  const createdUsers = [];
  for (const demoUser of demoUsers) {
    const password = await bcrypt.hash(demoUser.password, 10);
    const user = await User.findOneAndUpdate(
      { email: demoUser.email },
      { ...demoUser, password },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    createdUsers.push(user);
  }

  for (const user of createdUsers) {
    await Quest.deleteMany({ user: user._id });
    await Quest.insertMany(demoQuests.map((quest) => ({ ...quest, user: user._id })));
  }

  console.log("Demo data ready:");
  createdUsers.forEach((user) => {
    console.log(`- ${user.name}: ${user.email} / demo1234`);
  });
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed demo data", error);
    process.exit(1);
  });
