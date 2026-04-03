import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import NotificationCenter from "../components/NotificationCenter.jsx";
import PlannerTaskBoard from "../components/PlannerTaskBoard.jsx";
import ProductivityChart from "../components/ProductivityChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { SearchIcon, SparklesIcon, TargetIcon, TrophyIcon, ZapIcon } from "../components/V0Icons.jsx";

const emptyTaskForm = {
  title: "",
  description: "",
  category: "Study",
  priority: "Medium",
  deadline: "",
  view: "daily"
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.05, ease: "easeOut" }
  })
};

const reorderTasks = (tasks, draggedId, targetId) => {
  const next = [...tasks];
  const fromIndex = next.findIndex((task) => task._id === draggedId);
  const toIndex = next.findIndex((task) => task._id === targetId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return next;
  }

  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const ProductivityPlannerPage = () => {
  const { token, setUser } = useAuth();
  const [plannerState, setPlannerState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("daily");
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [journalForm, setJournalForm] = useState({ title: "", body: "", mood: "Reflective" });
  const [editingTaskId, setEditingTaskId] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const syncState = (response) => {
    setPlannerState(response);
    setUser(response.user);
    setError("");
  };

  useEffect(() => {
    api
      .getPlanner(token)
      .then(syncState)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [token, setUser]);

  const tasks = plannerState?.planner?.tasks || [];
  const habits = plannerState?.planner?.habits || [];
  const goals = plannerState?.planner?.goals || [];
  const notifications = plannerState?.planner?.notifications || [];
  const journalEntries = plannerState?.planner?.journalEntries || [];
  const charts = plannerState?.charts || {};
  const insights = plannerState?.insights || {};
  const stats = plannerState?.stats || {};

  const visibleTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.view === view)
        .filter((task) => (categoryFilter === "All" ? true : task.category === categoryFilter))
        .filter((task) => {
          if (statusFilter === "Completed") {
            return task.completed;
          }

          if (statusFilter === "Open") {
            return !task.completed;
          }

          return true;
        })
        .filter((task) => {
          const query = searchQuery.trim().toLowerCase();
          if (!query) {
            return true;
          }

          return [task.title, task.description, task.category].join(" ").toLowerCase().includes(query);
        }),
    [tasks, view, categoryFilter, statusFilter, searchQuery]
  );

  const submitTask = async (event) => {
    event.preventDefault();
    const payload = {
      ...taskForm,
      deadline: taskForm.deadline || null
    };

    const response = editingTaskId
      ? await api.updatePlannerTask(token, editingTaskId, payload)
      : await api.createPlannerTask(token, payload);

    syncState(response);
    setTaskForm(emptyTaskForm);
    setEditingTaskId("");
  };

  const handleTaskToggle = async (task) => {
    const response = await api.updatePlannerTask(token, task._id, {
      completed: !task.completed
    });
    syncState(response);
  };

  const handleDeleteTask = async (taskId) => {
    const response = await api.deletePlannerTask(token, taskId);
    syncState(response);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
      view: task.view
    });
  };

  const handleDrop = async (targetId) => {
    const reordered = reorderTasks(tasks, draggedTaskId, targetId);
    const response = await api.reorderPlannerTasks(
      token,
      reordered.map((task) => task._id)
    );
    syncState(response);
    setDraggedTaskId("");
  };

  const handleReadNotification = async (notificationId) => {
    const response = await api.readPlannerNotification(token, notificationId);
    syncState(response);
  };

  const handleHabitProgress = async (habit, delta) => {
    const response = await api.updatePlannerHabit(token, habit._id, {
      current: Math.max(0, habit.current + delta)
    });
    syncState(response);
  };

  const handleGoalProgress = async (goal, delta) => {
    const nextProgress = Math.min(100, Math.max(0, goal.progress + delta));
    const response = await api.updatePlannerGoal(token, goal._id, {
      progress: nextProgress,
      status: nextProgress === 100 ? "Completed" : nextProgress >= 45 ? "On Track" : "Needs Focus"
    });
    syncState(response);
  };

  const handleJournalSubmit = async (event) => {
    event.preventDefault();
    const response = await api.createJournalEntry(token, journalForm);
    syncState(response);
    setJournalForm({ title: "", body: "", mood: "Reflective" });
  };

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-600">Loading your planner...</div>;
  }

  if (error) {
    return <div className="pastel-shell rounded-2xl p-6 text-slate-700">{error}</div>;
  }

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.section custom={0} variants={fadeUp} className="hero-shell overflow-hidden rounded-[2rem] border border-cyan-200/30 px-6 py-7">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-700">Productivity Planner</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
              Tasks, habits, goals, and future path planning in one responsive workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
              Organize daily and weekly work, track streaks, review reflections, and use AI-style recommendations to shape a better next version of your routine.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="soft-chip px-4 py-2 text-sm">Daily goal: {insights.dailyGoal}</span>
              <span className="soft-chip px-4 py-2 text-sm">Unread alerts: {stats.unreadNotifications || 0}</span>
            </div>
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "XP", value: stats.xp || 0, icon: TrophyIcon },
                { label: "Level", value: stats.level || 0, icon: SparklesIcon },
                { label: "Streak", value: `${stats.streak || 0} days`, icon: ZapIcon },
                { label: "Completion", value: `${stats.completionRate || 0}%`, icon: TargetIcon }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.4rem] border border-cyan-100 bg-white/75 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">{item.label}</p>
                      <Icon className="h-4 w-4 text-cyan-700" />
                    </div>
                    <p className="mt-4 text-3xl font-bold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section custom={1} variants={fadeUp} className="space-y-6">
          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Task Manager</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Add or refine a task</h2>
              </div>
              <div className="flex gap-2">
                {["daily", "weekly"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setView(option)}
                    className={`rounded-full px-4 py-2 text-sm transition ${view === option ? "soft-button" : "soft-button-secondary"}`}
                  >
                    {option === "daily" ? "Daily View" : "Weekly View"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-[1.3fr_0.85fr_0.85fr]">
              <label className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input-field pl-11"
                  placeholder="Search tasks, notes, categories..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>
              <select className="input-field" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                {["All", "Study", "Work", "Health", "Personal", "Future"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select className="input-field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {["All", "Open", "Completed"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <form className="grid gap-3 md:grid-cols-2" onSubmit={submitTask}>
              <input
                className="input-field"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
              <select
                className="input-field"
                value={taskForm.category}
                onChange={(event) => setTaskForm((current) => ({ ...current, category: event.target.value }))}
              >
                {["Study", "Work", "Health", "Personal", "Future"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                className="input-field"
                value={taskForm.priority}
                onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}
              >
                {["Easy", "Medium", "Hard"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                className="input-field"
                value={taskForm.deadline}
                onChange={(event) => setTaskForm((current) => ({ ...current, deadline: event.target.value }))}
              />
              <select
                className="input-field"
                value={taskForm.view}
                onChange={(event) => setTaskForm((current) => ({ ...current, view: event.target.value }))}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <div className="md:col-span-2">
                <textarea
                  className="input-field min-h-28"
                  placeholder="Short description"
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button type="submit" className="soft-button rounded-full px-5 py-3 text-sm font-semibold">
                  {editingTaskId ? "Update Task" : "Add Task"}
                </button>
                {editingTaskId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTaskId("");
                      setTaskForm(emptyTaskForm);
                    }}
                    className="soft-button-secondary rounded-full px-5 py-3 text-sm"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <PlannerTaskBoard
            tasks={visibleTasks}
            view={view}
            onToggleComplete={handleTaskToggle}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onDragStart={setDraggedTaskId}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <ProductivityChart title="Weekly completions" subtitle="Task completion rate" points={charts.weeklyCompletions || []} />
            <ProductivityChart title="Productivity pulse" subtitle="Momentum trend" points={charts.productivityTrend || []} variant="line" />
          </div>
        </motion.section>

        <motion.section custom={2} variants={fadeUp} className="space-y-6">
          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Smart Focus</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">AI-style suggestions</h2>
            <div className="mt-5 space-y-3">
              {(insights.recommendations || []).map((item) => (
                <div key={item} className="rounded-[1.3rem] border border-cyan-100 bg-white/75 p-4 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[1.4rem] border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-medium text-emerald-700">Future Path Planner</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{insights.futurePath}</p>
            </div>
            <div className="mt-4 rounded-[1.4rem] border border-cyan-100 bg-white/75 p-4">
              <p className="text-sm font-medium text-cyan-700">Authentication mode</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{insights.faceLoginStatus}</p>
            </div>
          </div>

          <NotificationCenter notifications={notifications} onRead={handleReadNotification} />

          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Habit Tracker</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Build repeatable wins</h2>
            <div className="mt-5 space-y-3">
              {habits.map((habit) => (
                <div key={habit._id} className="rounded-[1.3rem] border border-cyan-100 bg-white/75 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{habit.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {habit.current}/{habit.target} target | {habit.streak} day streak
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleHabitProgress(habit, -1)} className="soft-button-secondary rounded-full px-3 py-1.5 text-sm">
                        -
                      </button>
                      <button type="button" onClick={() => handleHabitProgress(habit, 1)} className="soft-button rounded-full px-3 py-1.5 text-sm">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Goals and Reflection</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Long-term planning</h2>
            <div className="mt-5 space-y-4">
              {goals.map((goal) => (
                <div key={goal._id} className="rounded-[1.3rem] border border-cyan-100 bg-white/75 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{goal.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{goal.detail}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {goal.horizon} | {goal.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleGoalProgress(goal, -10)} className="soft-button-secondary rounded-full px-3 py-1.5 text-sm">
                        -10
                      </button>
                      <button type="button" onClick={() => handleGoalProgress(goal, 10)} className="soft-button rounded-full px-3 py-1.5 text-sm">
                        +10
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 transition-all duration-500" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <form className="mt-6 space-y-3" onSubmit={handleJournalSubmit}>
              <input
                className="input-field"
                placeholder="Journal title"
                value={journalForm.title}
                onChange={(event) => setJournalForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
              <select
                className="input-field"
                value={journalForm.mood}
                onChange={(event) => setJournalForm((current) => ({ ...current, mood: event.target.value }))}
              >
                {["Focused", "Balanced", "Drained", "Motivated", "Reflective"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <textarea
                className="input-field min-h-28"
                placeholder="Write a short reflection..."
                value={journalForm.body}
                onChange={(event) => setJournalForm((current) => ({ ...current, body: event.target.value }))}
                required
              />
              <button type="submit" className="soft-button rounded-full px-5 py-3 text-sm font-semibold">
                Save Reflection
              </button>
            </form>

            {journalEntries.length ? (
              <div className="mt-6 space-y-3">
                {journalEntries.slice(0, 3).map((entry) => (
                  <div key={entry._id} className="rounded-[1.3rem] border border-cyan-100 bg-white/75 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-slate-900">{entry.title}</p>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-700">{entry.mood}</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{entry.body}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Task Snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Current view load</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.3rem] border border-cyan-100 bg-white/75 p-4">
                <p className="text-sm text-slate-600">Visible tasks</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{visibleTasks.length}</p>
              </div>
              <div className="rounded-[1.3rem] border border-cyan-100 bg-white/75 p-4">
                <p className="text-sm text-slate-600">Hard tasks</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{tasks.filter((task) => task.priority === "Hard" && !task.completed).length}</p>
              </div>
              <div className="rounded-[1.3rem] border border-cyan-100 bg-white/75 p-4">
                <p className="text-sm text-slate-600">Category groups</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{(charts.categoryBreakdown || []).length}</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default ProductivityPlannerPage;
