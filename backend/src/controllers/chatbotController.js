import { generateChatbotReply, normalizeHistory } from "../services/chatbotService.js";

export const sendChatbotMessage = async (req, res, next) => {
  try {
    const message = String(req.body?.message || "").trim();
    const history = normalizeHistory(req.body?.history);

    if (!message) {
      const error = new Error("Message is required.");
      error.status = 400;
      throw error;
    }

    const reply = await generateChatbotReply({
      message: message.slice(0, 2000),
      history
    });

    res.json({
      reply: reply || "I am here with you.",
      success: true
    });
  } catch (error) {
    next(error);
  }
};
