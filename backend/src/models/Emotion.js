import mongoose from "mongoose";

const emotionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    emotion: {
      type: String,
      required: true,
      enum: ["happy", "sad", "angry", "neutral", "fear", "surprise", "disgust", "focused", "stressed"]
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    allScores: {
      type: Map,
      of: Number,
      default: {}
    },
    source: {
      type: String,
      enum: ["webcam", "upload"],
      default: "webcam"
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

const Emotion = mongoose.model("Emotion", emotionSchema);

export default Emotion;
