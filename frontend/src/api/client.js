const API_URL = import.meta.env.VITE_API_URL;
const apiOrigin = (() => {
  try {
    const url = new URL(API_URL);
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return API_URL;
  }
})();

const request = async (path, { method = "GET", token, body } = {}) => {
  if (!API_URL) {
    throw new Error("VITE_API_URL is missing. Set it in the frontend environment before starting the app.");
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error(`Unable to reach the backend. Make sure the API is running at ${apiOrigin}.`);
  }

  const contentType = response.headers.get("content-type") || "";
  const isJsonResponse = contentType.includes("application/json");
  const rawBody = await response.text();

  let data = null;

  if (rawBody) {
    if (isJsonResponse) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        throw new Error("The backend returned invalid JSON. Restart the backend and try again.");
      }
    } else if (!response.ok) {
      const compactText = rawBody.replace(/\s+/g, " ").trim();
      const details = compactText ? ` Received: ${compactText.slice(0, 120)}.` : "";
      throw new Error(`The API returned a non-JSON error response.${details}`);
    } else {
      throw new Error("The backend returned an unexpected response format. Restart the backend and try again.");
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data ?? {};
};

export const api = {
  // Authentication
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
  verifySignupOtp: (payload) => request("/auth/verify-signup-otp", { method: "POST", body: payload }),
  verifyLoginOtp: (payload) => request("/auth/verify-login-otp", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),
  chatbot: (token, payload) => request("/chatbot", { method: "POST", token, body: payload }),

  // Analysis & Insights
  analyzeUser: (token, payload) => request("/analysis/analyze-user", { method: "POST", token, body: payload }),
  futureSelfScan: (token, payload) => request("/analysis/future-self-scan", { method: "POST", token, body: payload }),
  simulateFuture: (token, payload) => request("/analysis/simulate-future", { method: "POST", token, body: payload }),

  // Dashboard
  getDashboard: (token) => request("/dashboard", { token }),

  // Emotions
  analyzeEmotion: (token, payload) => request("/emotions/analyze", { method: "POST", token, body: payload }),
  getEmotionSummary: (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/emotions/summary?${params}`, { token });
  },
  getEmotionJournalContext: (token) => request("/emotions/journal-context", { token }),
  getEmotionHabitInsights: (token) => request("/emotions/habit-insights", { token }),

  // Legacy Planner (keep for backward compatibility)
  getPlanner: (token) => request("/planner", { token }),

  // Task Management
  createTask: (token, payload) => request("/tasks", { method: "POST", token, body: payload }),
  getTasks: (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/tasks?${params}`, { token });
  },
  getTask: (token, taskId) => request(`/tasks/${taskId}`, { token }),
  updateTask: (token, taskId, payload) => request(`/tasks/${taskId}`, { method: "PATCH", token, body: payload }),
  completeTask: (token, taskId) => request(`/tasks/${taskId}/complete`, { method: "PATCH", token }),
  deleteTask: (token, taskId) => request(`/tasks/${taskId}`, { method: "DELETE", token }),
  reorderTasks: (token, tasks) => request("/tasks/reorder", { method: "POST", token, body: { tasks } }),
  searchTasks: (token, query) => request(`/tasks/search?q=${encodeURIComponent(query)}`, { token }),

  // Notifications
  createNotification: (token, payload) => request("/notifications", { method: "POST", token, body: payload }),
  getNotifications: (token, unreadOnly = false) => request(`/notifications?unreadOnly=${unreadOnly}`, { token }),
  markNotificationAsRead: (token, notificationId) => request(`/notifications/${notificationId}/read`, { method: "PATCH", token }),
  markAllNotificationsAsRead: (token) => request("/notifications/read-all", { method: "PATCH", token }),
  deleteNotification: (token, notificationId) => request(`/notifications/${notificationId}`, { method: "DELETE", token }),
  clearAllNotifications: (token) => request("/notifications", { method: "DELETE", token }),
  checkDeadlineNotifications: (token) => request("/notifications/check-deadlines", { method: "POST", token }),

  // Habits
  createHabit: (token, payload) => request("/habits", { method: "POST", token, body: payload }),
  getHabits: (token) => request("/habits", { token }),
  getHabit: (token, habitId) => request(`/habits/${habitId}`, { token }),
  updateHabitProgress: (token, habitId, payload) => request(`/habits/${habitId}/progress`, { method: "PATCH", token, body: payload }),
  incrementHabitProgress: (token, habitId, payload) => request(`/habits/${habitId}/increment`, { method: "PATCH", token, body: payload }),
  completeHabitToday: (token, habitId) => request(`/habits/${habitId}/complete-today`, { method: "PATCH", token }),
  resetDailyHabits: (token) => request("/habits/reset-daily", { method: "POST", token }),
  deleteHabit: (token, habitId) => request(`/habits/${habitId}`, { method: "DELETE", token }),

  // Goals
  createGoal: (token, payload) => request("/goals", { method: "POST", token, body: payload }),
  getGoals: (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/goals?${params}`, { token });
  },
  getGoal: (token, goalId) => request(`/goals/${goalId}`, { token }),
  updateGoal: (token, goalId, payload) => request(`/goals/${goalId}`, { method: "PATCH", token, body: payload }),
  deleteGoal: (token, goalId) => request(`/goals/${goalId}`, { method: "DELETE", token }),

  // Journal
  createJournalEntry: (token, payload) => request("/journal", { method: "POST", token, body: payload }),
  getJournalEntries: (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/journal?${params}`, { token });
  },
  getJournalEntry: (token, entryId) => request(`/journal/${entryId}`, { token }),
  updateJournalEntry: (token, entryId, payload) => request(`/journal/${entryId}`, { method: "PATCH", token, body: payload }),
  deleteJournalEntry: (token, entryId) => request(`/journal/${entryId}`, { method: "DELETE", token }),
  getMoodStats: (token) => request("/journal/stats/mood", { token }),

  // Quests
  generateQuests: (token) => request("/quests/generate", { method: "POST", token }),
  completeQuest: (token, questId) => request(`/quests/${questId}/complete`, { method: "PATCH", token })
};
