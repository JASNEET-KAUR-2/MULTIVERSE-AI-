import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const notificationStyles = {
  deadline: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
  reminder: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800",
  achievement: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
  task: "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800",
  habit: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  emotion: "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800",
  system: "bg-white/80 border-cyan-100 dark:bg-slate-800/80 dark:border-cyan-900"
};

const NotificationCenter = ({ notifications = [], onRead, compact = false }) => {
  const { token } = useAuth();
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [loading, setLoading] = useState(false);

  // Fetch notifications if not provided
  useEffect(() => {
    if (!token || notifications.length > 0) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.getNotifications(token);
        setLocalNotifications(response.notifications || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, notifications.length]);

  const displayNotifications = notifications.length > 0 ? notifications : localNotifications;
  const unreadCount = displayNotifications.filter((n) => !n.read).length;
  const displayItems = compact ? displayNotifications.slice(0, 6) : displayNotifications;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(token, notificationId);
      setLocalNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      if (onRead) {
        onRead(notificationId);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <div className="dynamic-panel rounded-[1.7rem] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Notification Center
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            Alerts and history
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your future is built one reminder at a time.
          </p>
        </div>
        <div className="soft-chip px-3 py-1 text-xs">
          {loading ? "..." : `${unreadCount} unread`}
        </div>
      </div>

      <div className="space-y-3">
        {loading && displayNotifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500">Loading notifications...</div>
        ) : displayNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">📳</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No notifications yet. Check back soon!
            </p>
          </div>
        ) : (
          displayItems.map((notification) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-[1.3rem] border p-4 transition-all ${
                notificationStyles[notification.type] || notificationStyles.system
              } ${!notification.read ? "ring-2 ring-offset-1 ring-indigo-400" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {notification.message}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {notification.type} · {" "}
                    {new Date(notification.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                </div>
                {!notification.read ? (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="soft-button-secondary rounded-full px-3 py-1.5 text-xs whitespace-nowrap"
                  >
                    Mark read
                  </button>
                ) : (
                  <span className="rounded-full bg-white/90 dark:bg-slate-700 px-3 py-1 text-xs text-slate-500 whitespace-nowrap">
                    Seen
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
