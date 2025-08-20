"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [time, setTime] = useState(new Date());

  // تحديث الساعة كل ثانية
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // إضافة مهمة
  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = {
      text: task,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setTask("");
  };

  // تشيك المهمة
  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  // حذف المهمة
  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-amber-50 p-6 font-sans">
      
      {/* التاريخ + الوقت */}
      <div className="flex justify-between w-full max-w-2xl mb-6 text-gray-700 text-lg">
        <span>{time.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        <span>{time.toLocaleTimeString()}</span>
      </div>

      {/* العنوان */}
      <h1 className="text-5xl font-bold text-black mb-6"> TO DO LIST </h1>
       <div className="flex gap-2 mb-10"> 
        <input type="text" value={task} onChange={(e) => setTask(e.target.value)}
         placeholder="enter your task " 
         className="border border-gray-900 rounded-xl p-2 w-64 focus:outline-none focus:ring text-black" /> 
         <button onClick={addTask} className="bg-neutral-900 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow" > 
          + add Task </button> </div>
      {/* قائمة المهام */}
   <ul className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-4">
  {tasks.map((t, index) => (
    <li
      key={index}
      className={`flex justify-between items-center py-3 border-b border-gray-200 ${
        t.completed ? "line-through text-gray-400" : "text-gray-800"
      }`}
    >
      {/* الرقم + نص المهمة */}
      <span className="text-lg flex items-center gap-2">
        <span className="font-bold text-blue-500">{index + 1}.</span>
        {t.text}
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => toggleTask(index)}
          className={`px-3 py-1 rounded ${
            t.completed
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          ✅
        </button>
        <button
          onClick={() => deleteTask(index)}
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
