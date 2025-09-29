"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos on mount
  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch("/api/todos");
      const data: unknown = await res.json();
      const todos = data as Todo[];
      setTodos(sortByNewest(todos));
    };
    fetchTodos();
  }, []);

  const sortByNewest = (items: Todo[]) =>
    [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo }),
    });
    const created: Todo = await res.json();
    setTodos(sortByNewest([created, ...todos]));
    setNewTodo("");
  };

  const toggleTodo = async (id: string) => {
    await fetch(`/api/todos?id=${id}`, { method: "PUT" });
    setTodos((prev) =>
      sortByNewest(
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      )
    );
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-gray-100 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Todos</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 p-2 border rounded"
          type="text"
          value={newTodo}
          placeholder="Add a todo"
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button
          className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={addTodo}
        >
          Add
        </button>
      </div>

      <ul>
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.li
              key={todo.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-between items-center mb-2 p-2 bg-white rounded shadow"
            >
              <div className="flex flex-col">
                <span
                  className={`${
                    todo.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  {todo.text}
                </span>
                <small className="text-gray-500 text-xs">
                  {new Date(todo.createdAt).toLocaleString()}
                </small>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed ? "Undo" : "Done"}
                </button>
                <button
                  className="px-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
