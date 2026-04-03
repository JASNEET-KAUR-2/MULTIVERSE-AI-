const priorityStyles = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-sky-100 text-sky-700",
  Hard: "bg-amber-100 text-amber-700"
};

const PlannerTaskBoard = ({
  tasks = [],
  view = "daily",
  onToggleComplete,
  onDelete,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const visibleTasks = tasks.filter((task) => task.view === view);

  if (!visibleTasks.length) {
    return (
      <div className="dynamic-panel rounded-[1.7rem] p-6 text-sm text-slate-600">
        No {view} tasks yet. Add one to start building a calmer and more focused routine.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {visibleTasks.map((task) => (
        <article
          key={task._id}
          draggable
          onDragStart={() => onDragStart(task._id)}
          onDragOver={(event) => onDragOver(event)}
          onDrop={() => onDrop(task._id)}
          className={`dynamic-panel rounded-[1.6rem] p-5 transition duration-300 ${task.completed ? "scale-[0.99] opacity-80" : "hover:-translate-y-1"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">{task.category}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[task.priority] || priorityStyles.Medium}`}>{task.priority}</span>
              </div>
              <h3 className={`mt-3 text-xl font-semibold ${task.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>{task.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p>
            </div>
            <div className="rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs text-slate-500">
              {task.deadline ? new Date(task.deadline).toLocaleDateString([], { month: "short", day: "numeric" }) : "No date"}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => !task.completed && onToggleComplete(task)}
              disabled={task.completed}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${task.completed ? "cursor-default bg-emerald-100 text-emerald-700" : "soft-button"}`}
            >
              {task.completed ? "Completed" : `Complete +${task.priority === "Hard" ? 80 : task.priority === "Medium" ? 40 : 20} XP`}
            </button>
            <button type="button" onClick={() => onEdit(task)} className="soft-button-secondary rounded-full px-4 py-2 text-sm">
              Edit
            </button>
            <button type="button" onClick={() => onDelete(task._id)} className="rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm text-rose-600">
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PlannerTaskBoard;
