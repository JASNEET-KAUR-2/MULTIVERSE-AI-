import { Router } from "express";
import { sendChatbotMessage } from "../controllers/chatbotController.js";

const router = Router();

router.post("/", sendChatbotMessage);

export default router;
