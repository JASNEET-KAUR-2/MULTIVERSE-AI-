const DEFAULT_SYSTEM_PROMPT = `You are a helpful, friendly AI assistant embedded in a productivity app.
Your role is to:
- Answer clearly and concisely
- Be warm, practical, and supportive
- Help with focus, planning, habits, journaling, and next steps
- Ask clarifying questions when needed
- Keep responses readable and not too long

Remember: You are chatting inside a compact app interface, so stay useful and direct.`;

const DEFAULT_GROQ_URL = "https://api.groq.com/openai/v1";
const DEFAULT_OPENAI_URL = "https://api.openai.com/v1";
const DEFAULT_DEEPSEEK_URL = "https://api.deepseek.com";
const DEFAULT_ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const normalizeHistory = (history = []) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: String(entry.content || "").trim()
    }))
    .filter((entry) => entry.content)
    .slice(-10);
};

const getConfiguredProvider = () => {
  const explicitProvider = (process.env.AI_PROVIDER || process.env.AIPROVIDER || "").trim().toLowerCase();

  if (explicitProvider) {
    return explicitProvider;
  }

  if (process.env.GROQ_API_KEY) {
    return "groq";
  }

  if (process.env.OPENAI_API_KEY || process.env.OPENAIAPIKEY) {
    return "openai";
  }

  if (process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEKAPIKEY) {
    return "deepseek";
  }

  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPICAPIKEY) {
    return "claude";
  }

  return "fallback";
};

const getSystemPrompt = () => process.env.SYSTEMPROMPT || DEFAULT_SYSTEM_PROMPT;

const buildChatMessages = (message, history) => [
  { role: "system", content: getSystemPrompt() },
  ...normalizeHistory(history),
  { role: "user", content: message }
];

const readJsonSafely = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const createProviderError = async (response, fallbackMessage) => {
  const data = await readJsonSafely(response);
  const error = new Error(
    data?.error?.message || data?.message || data?.error || fallbackMessage
  );
  error.status = response.status;
  throw error;
};

const requestOpenAiCompatibleChat = async ({
  apiUrl,
  apiKey,
  model,
  message,
  history,
  includeTemperature = true
}) => {
  const body = {
    model,
    messages: buildChatMessages(message, history),
    max_tokens: 500
  };

  if (includeTemperature) {
    body.temperature = 0.7;
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    await createProviderError(response, "Chat generation failed.");
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("The AI provider returned an empty response.");
  }

  return reply;
};

const requestClaudeChat = async ({ apiKey, model, message, history }) => {
  const response = await fetch(DEFAULT_ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: getSystemPrompt(),
      messages: [
        ...normalizeHistory(history).map((entry) => ({
          role: entry.role,
          content: entry.content
        })),
        { role: "user", content: message }
      ]
    })
  });

  if (!response.ok) {
    await createProviderError(response, "Claude generation failed.");
  }

  const data = await response.json();
  const reply = data?.content?.find((part) => part?.type === "text")?.text?.trim();

  if (!reply) {
    throw new Error("Claude returned an empty response.");
  }

  return reply;
};

const getFallbackResponse = (message) => {
  const prompts = [
    "Start with one small task you can finish in 10 minutes, then build from there.",
    "Try reducing context switching for the next 20 minutes and focus on one clear outcome.",
    "A quick journal entry can help: what feels blocked, and what is the smallest next move?",
    "You can treat this moment like a reset. Pick one useful action and make it easy to begin."
  ];

  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  return `I am running in demo mode right now. You said: "${message}". ${prompt}`;
};

export const generateChatbotReply = async ({ message, history = [] }) => {
  const trimmedMessage = String(message || "").trim().slice(0, 2000);

  if (!trimmedMessage) {
    const error = new Error("Message is required.");
    error.status = 400;
    throw error;
  }

  const provider = getConfiguredProvider();

  try {
    if (provider === "groq" && process.env.GROQ_API_KEY) {
      return await requestOpenAiCompatibleChat({
        apiUrl: process.env.GROQ_API_URL || DEFAULT_GROQ_URL,
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.CHATBOT_MODEL || process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        message: trimmedMessage,
        history
      });
    }

    if (provider === "openai" && (process.env.OPENAI_API_KEY || process.env.OPENAIAPIKEY)) {
      return await requestOpenAiCompatibleChat({
        apiUrl: process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_URL,
        apiKey: process.env.OPENAI_API_KEY || process.env.OPENAIAPIKEY,
        model: process.env.CHATBOT_MODEL || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        message: trimmedMessage,
        history
      });
    }

    if (provider === "deepseek" && (process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEKAPIKEY)) {
      const model = process.env.CHATBOT_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-chat";
      return await requestOpenAiCompatibleChat({
        apiUrl: process.env.DEEPSEEK_BASE_URL || DEFAULT_DEEPSEEK_URL,
        apiKey: process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEKAPIKEY,
        model,
        message: trimmedMessage,
        history,
        includeTemperature: model !== "deepseek-reasoner"
      });
    }

    if (provider === "claude" && (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPICAPIKEY)) {
      return await requestClaudeChat({
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPICAPIKEY,
        model: process.env.CHATBOT_MODEL || process.env.CLAUDE_MODEL || "claude-3-haiku-20240307",
        message: trimmedMessage,
        history
      });
    }

    return getFallbackResponse(trimmedMessage);
  } catch (error) {
    const messageText = String(error.message || "");
    const isProviderIssue =
      error.status === 401 ||
      error.status === 429 ||
      /quota|rate limit|invalid api key|authentication|unauthorized/i.test(messageText);

    if (isProviderIssue) {
      return getFallbackResponse(trimmedMessage);
    }

    error.status = error.status || 502;
    throw error;
  }
};

export { normalizeHistory };
