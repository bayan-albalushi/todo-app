"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [task, setTask] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all, completed, pending
  const [time, setTime] = useState(new Date());

  // استرجاع المهام من localStorage عند أول تحميل
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const parsedTasks = savedTasks.map(t => ({
      ...t,
      dueTime: t.dueTime ? new Date(t.dueTime) : null
    }));
    setTasks(parsedTasks);
  }, []);

  // تحديث الساعة كل ثانية
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // تحديث العد التنازلي والإشعارات
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks =>
        prevTasks.map(t => {
          if (!t.dueTime) return t;

          const diffMs = t.dueTime - new Date();
          const diffSec = Math.floor(diffMs / 1000);
          const minutesLeft = Math.floor(diffSec / 60);
          const secondsLeft = Math.max(0, diffSec % 60);

          const countdown = `${minutesLeft}m ${secondsLeft}s`;
          const countdownColor =
            diffSec > 600
              ? "text-green-600"
              : diffSec > 0
              ? "text-orange-500"
              : "text-red-500";

          // إشعار قبل 10 دقائق
          if (!t.notified10 && diffSec <= 600 && diffSec > 590) {
            if (Notification.permission === "granted") {
              new Notification("Reminder ⏰", { body: t.text, icon: "/notification-icon.png" });
            }
            t.notified10 = true;
          }

          // إشعار عند انتهاء الوقت
          if (!t.completed && !t.notifiedEnd && diffSec <= 0) {
            if (Notification.permission === "granted") {
              new Notification("⏰ Task Overdue!", {
                body: `The task "${t.text}" was not completed!`,
                icon: "/notification-icon.png"
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                  new Notification("⏰ Task Overdue!", {
                    body: `The task "${t.text}" was not completed!`,
                    icon: "/notification-icon.png"
                  });
                }
              });
            }
            t.notifiedEnd = true;
          }

          return { ...t, countdown, countdownColor };
        }).sort((a, b) => {
          if (!a.dueTime) return 1;
          if (!b.dueTime) return -1;
          return a.dueTime - b.dueTime;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // حفظ المهام في localStorage
  useEffect(() => {
    const tasksToSave = tasks.map(t => ({
      ...t,
      dueTime: t.dueTime ? t.dueTime.toISOString() : null
    }));
    localStorage.setItem("tasks", JSON.stringify(tasksToSave));
  }, [tasks]);

  // إضافة مهمة جديدة
  const addTask = () => {
    if (!task.trim()) return;
    const newTask = {
      text: task,
      completed: false,
      dueTime: dueTime ? new Date(dueTime) : null,
      notified10: false,
      notifiedEnd: false,
      countdown: "",
      countdownColor: "text-green-600"
    };
    setTasks([...tasks, newTask]);
    setTask("");
    setDueTime("");
  };

  // تبديل حالة المهمة (مكتملة/غير مكتملة)
  const toggleTask = index => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  // حذف مهمة
  const deleteTask = index => setTasks(tasks.filter((_, i) => i !== index));

  // فلترة المهام
  const filteredTasks = tasks.filter(t => {
    if (filter === "all") return true;
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-amber-50 p-6 font-sans">
      {/* التاريخ والوقت */}
      <div className="flex justify-between w-full max-w-2xl mb-6 text-gray-700 text-lg">
        <span>{time.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        <span>{time.toLocaleTimeString()}</span>
      </div>

      <h1 className="text-5xl font-bold text-black mb-6">TO DO LIST</h1>

      {/* إضافة المهمة */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="Enter your task"
          className="border border-gray-900 rounded-xl p-2 w-64 focus:outline-none focus:ring text-black"
        />
        <input
          type="datetime-local"
          value={dueTime}
          onChange={e => setDueTime(e.target.value)}
          className="border border-gray-900 rounded-xl p-2 text-black"
        />
        <button
          onClick={addTask}
          className="bg-neutral-900 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow"
        >
          + add Task
        </button>
      </div>

      {/* الفلاتر بنفس تصميم زر + add Task */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          className={`bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-lg shadow ${filter === "all" ? "ring-2 " : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`bg-emerald-950 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg shadow ${filter === "completed" ? "ring-2 " : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={`bg-red-950 hover:bg-red-900 text-white px-4 py-2 rounded-lg shadow ${filter === "pending" ? "ring-2 ring-orange-500" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
      </div>

      {/* قائمة المهام */}
      <ul className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-4">
        {filteredTasks.map((t, index) => (
          <li
            key={index}
            className={`flex justify-between items-center py-3 border-b border-gray-200 ${t.completed ? "line-through text-gray-400" : t.dueTime && t.dueTime < new Date() ? "text-red-500" : "text-gray-800"}`}
          >
            <span className="text-lg flex items-center gap-2">
              <span className="font-bold text-blue-500">{index + 1}.</span>
              {t.text}
              {t.dueTime && <span className={`ml-4 text-sm ${t.countdownColor}`}>({t.countdown})</span>}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => toggleTask(tasks.indexOf(t))}
                className={`px-3 py-1 rounded ${t.completed ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
              >
                ✅
              </button>
              <button
                onClick={() => deleteTask(tasks.indexOf(t))}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
