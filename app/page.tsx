"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Todo = {
  id: string;
  text: string;
  createdAt: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(sortByNewest(data)));
  }, []);

  const sortByNewest = (items: Todo[]) => {
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo }),
    });

    const created = await res.json();
    setTodos((prev) => sortByNewest([...prev, created]));
    setNewTodo("");
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="max-w-xl mx-auto pt-12">
      <h1 className="text-4xl font-bold mb-6 text-center">🔥 Todo App</h1>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600"
        />
        <button className="btn btn-primary">Add</button>
      </form>

      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            className="todo-card flex justify-between items-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <div>
              <p className="font-medium">{todo.text}</p>
              <span className="text-xs text-gray-400">
                {new Date(todo.createdAt).toLocaleString()}
              </span>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </main>
  );
}
