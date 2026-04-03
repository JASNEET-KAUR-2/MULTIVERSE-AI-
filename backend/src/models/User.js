import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    strengths: [String],
    weaknesses: [String],
    focusAreas: [String],
    recommendations: [String],
    personalityType: String,
    modelUsed: String,
    summary: String,
    confidence: Number,
    momentumScore: Number,
    riskScore: Number,
    nextBestAction: String,
    narrativeTone: String,
    habitAnchors: {
      primaryGoal: String,
      primaryHabit: String,
      consistencyBand: String
    },
    coachProfile: {
      title: String,
      headline: String,
      focus: String,
      energy: String,
      mission: String
    },
    insightCards: [
      {
        title: String,
        value: Number,
        tone: String,
        detail: String
      }
    ],
    driverSignals: [
      {
        label: String,
        strengthScore: Number,
        riskScore: Number
      }
    ],
    dailyTasks: [
      {
        title: String,
        description: String,
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"]
        }
      }
    ]
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ["High", "Average", "Negative"]
    },
    probabilities: {
      High: Number,
      Average: Number,
      Negative: Number
    },
    accuracy: Number,
    confidence: Number,
    modelName: String
  },
  { _id: false }
);

const behaviorProfileSchema = new mongoose.Schema(
  {
    studyHours: Number,
    sleepHours: Number,
    exercise: Boolean,
    screenTime: Number,
    consistency: Number,
    procrastination: Number,
    goalClarity: Number
  },
  { _id: false }
);

const simulationSchema = new mongoose.Schema(
  {
    futureStory: String,
    alternateStory: String,
    futureMessage: String,
    timelineVariants: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const scannerHistorySchema = new mongoose.Schema(
  {
    mood: String,
    energy: Number,
    engagement: Number,
    stress: Number,
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High"]
    },
    statusLabel: String,
    summary: String,
    futureWarning: String,
    bestMoveNow: String,
    suggestions: [String],
    thumbnail: String,
    cameraEnabled: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const activityLogSchema = new mongoose.Schema(
  {
    type: String,
    label: String,
    xpAwarded: Number,
    detail: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const simulationHistorySchema = new mongoose.Schema(
  {
    presetMode: String,
    behaviorProfile: behaviorProfileSchema,
    prediction: String,
    score: Number,
    story: String,
    improvementDelta: Number,
    topContributor: {
      key: String,
      label: String,
      delta: Number,
      explanation: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const plannerTaskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: {
      type: String,
      enum: ["Study", "Work", "Health", "Personal", "Future"],
      default: "Personal"
    },
    priority: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    deadline: Date,
    view: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily"
    },
    completed: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    completedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const habitTrackerSchema = new mongoose.Schema(
  {
    name: String,
    target: Number,
    current: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    completedToday: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const longTermGoalSchema = new mongoose.Schema(
  {
    title: String,
    detail: String,
    horizon: {
      type: String,
      enum: ["3 Months", "1 Year", "5 Years"],
      default: "1 Year"
    },
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["On Track", "Needs Focus", "Completed"],
      default: "On Track"
    }
  },
  { _id: true }
);

const journalEntrySchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    mood: {
      type: String,
      enum: ["Focused", "Balanced", "Drained", "Motivated", "Reflective"],
      default: "Reflective"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["deadline", "reminder", "achievement", "system"],
      default: "system"
    },
    title: String,
    message: String,
    read: {
      type: Boolean,
      default: false
    },
    channel: {
      type: String,
      enum: ["in-app", "email", "sms", "browser"],
      default: "in-app"
    },
    taskId: mongoose.Schema.Types.ObjectId,
    dueAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const plannerSettingsSchema = new mongoose.Schema(
  {
    browserPush: {
      type: Boolean,
      default: true
    },
    emailReminders: {
      type: Boolean,
      default: false
    },
    smsReminders: {
      type: Boolean,
      default: false
    },
    faceLoginEnabled: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    password: { type: String, required: true },
    age: Number,
    goals: [String],
    habits: [String],
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveAt: Date,
    lastQuestCompletedAt: Date,
    scannerStreak: { type: Number, default: 0 },
    lastScannerScanAt: Date,
    behaviorProfile: behaviorProfileSchema,
    analysis: analysisSchema,
    mlPrediction: predictionSchema,
    simulation: simulationSchema,
    scannerHistory: [scannerHistorySchema],
    activityLog: [activityLogSchema],
    simulationHistory: [simulationHistorySchema],
    plannerTasks: [plannerTaskSchema],
    habitTracker: [habitTrackerSchema],
    longTermGoals: [longTermGoalSchema],
    journalEntries: [journalEntrySchema],
    notificationCenter: [notificationSchema],
    plannerSettings: plannerSettingsSchema,
    guilds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guild"
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
