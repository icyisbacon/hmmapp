"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Todo = {
  id: string;
  text: string;
  createdAt: string;
};

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    // Sort by newest first
    data.sort((a: Todo, b: Todo) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTodos(data);
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ text: newTodo, createdAt: new Date().toISOString() }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setTodos((prev) => [data, ...prev]);
    setNewTodo("");
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className="container">
      <h1>My Todos</h1>
      <input
        placeholder="Add a new todo..."
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTodo()}
      />

      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            className="todo"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              {todo.text}
              <div className="timestamp">{new Date(todo.createdAt).toLocaleString()}</div>
            </div>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
