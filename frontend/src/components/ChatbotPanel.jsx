import { useMemo, useState } from "react";
import { api } from "../api/client";
import { ArrowRightIcon, MessageIcon, RefreshIcon, SparklesIcon } from "./V0Icons.jsx";

const starterMessages = [
  {
    role: "assistant",
    content: "I am your multiverse guide. Ask about focus, planning, habits, journaling, or your next best move."
  }
];

const ChatbotPanel = ({ token, userName = "Explorer" }) => {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.role === "user" || message.role === "assistant")
        .map((message) => ({
          role: message.role,
          content: message.content
        })),
    [messages]
  );

  const sendMessage = async (forcedMessage) => {
    const nextMessage = String(forcedMessage ?? input).trim();

    if (!nextMessage || submitting) {
      return;
    }

    const userMessage = { role: "user", content: nextMessage };
    const nextHistory = [...history, userMessage];

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSubmitting(true);
    setError("");

    try {
      const response = await api.chatbot(token, {
        message: nextMessage,
        history: nextHistory.slice(0, -1)
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.reply || "I am here with you."
        }
      ]);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="muse-card relative overflow-hidden rounded-[2rem] border border-[#d8c3ae] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(235,248,252,0.62))] p-6 shadow-[0_24px_60px_rgba(177,146,112,0.12)]">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_top,rgba(177,226,239,0.35),transparent_68%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-500">
            <SparklesIcon className="h-4 w-4 text-sky-600" />
            Chat Companion
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Talk with the multiverse guide</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Use this assistant for productivity advice, future planning, journaling prompts, or quick support while you move through the app.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessages(starterMessages);
            setInput("");
            setError("");
          }}
          className="soft-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
        >
          <RefreshIcon className="h-4 w-4" />
          Reset chat
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="mb-4 flex items-center gap-3 rounded-[1.4rem] border border-[#e9d8c8] bg-[#fffaf4] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d4eef5,#b4dce8)] text-slate-700">
              <MessageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">FutureSync Assistant</p>
              <p className="text-xs text-slate-500">{submitting ? "Thinking..." : "Online and ready"}</p>
            </div>
          </div>

          <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 shadow-[0_16px_28px_rgba(177,146,112,0.08)] ${
                    message.role === "user"
                      ? "bg-[linear-gradient(180deg,#cae8ef,#b7dbe7)] text-slate-800"
                      : "border border-[#ecdccf] bg-[#fffaf6] text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {submitting ? (
              <div className="flex justify-start">
                <div className="rounded-[1.5rem] border border-[#ecdccf] bg-[#fffaf6] px-4 py-3 text-sm text-slate-500">
                  The assistant is preparing your reply...
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your goals, planning, habits, future choices, or today’s focus..."
              className="input-field min-h-28 flex-1 resize-none"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="soft-button inline-flex min-w-36 items-center justify-center rounded-[1.3rem] px-5 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send"}
              {!submitting ? <ArrowRightIcon className="ml-2 h-5 w-5" /> : null}
            </button>
          </form>

          {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#e9d8c8] bg-[linear-gradient(180deg,#fffaf3,#eef8fb)] p-5 shadow-[0_18px_30px_rgba(177,146,112,0.08)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Personalized For</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{userName}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              The assistant works best when you ask about your goals, habits, blockers, journaling thoughts, or what to do next.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[#e9d8c8] bg-white/75 p-5 shadow-[0_18px_30px_rgba(177,146,112,0.08)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Suggested Prompts</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Plan my next 3 productive tasks",
                "Give me a journaling prompt for today",
                "I feel distracted. What should I do?",
                "Suggest one habit for better focus"
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={submitting}
                  className="rounded-full border border-[#dfc9b3] bg-[#fffaf4] px-4 py-2 text-sm text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotPanel;
