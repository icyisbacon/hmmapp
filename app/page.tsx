'use client'

import { useEffect, useState } from 'react'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)

  // Load todos from KV
  const loadTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/todos')
      if (response.ok) {
        const todosData: Todo[] = await response.json()
        setTodos(todosData)
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo }),
      })
      if (response.ok) {
        const todo: Todo = await response.json()
        setTodos((prev) => [...prev, todo])
        setNewTodo('')
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  // Toggle completion
  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t.id === id)
      if (!todo) return

      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !todo.completed }),
      })

      if (response.ok) {
        const updated: Todo = await response.json()
        setTodos((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        )
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  // Delete todo
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div className='max-w-md mx-auto mt-10 p-4 bg-white rounded shadow'>
      <h1 className='text-2xl font-bold mb-4'>Todo App</h1>
      <div className='flex mb-4'>
        <input
          type='text'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className='flex-1 border p-2 rounded-l'
          placeholder='Add new todo'
        />
        <button
          onClick={addTodo}
          className='bg-blue-500 text-white px-4 py-2 rounded-r'
        >
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className='flex justify-between items-center mb-2'
            >
              <span
                onClick={() => toggleTodo(todo.id)}
                className={`cursor-pointer ${
                  todo.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className='text-red-500'
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
