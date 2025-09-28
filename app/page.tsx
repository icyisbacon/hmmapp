'use client'

import { useState, useEffect } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Load todos on component mount
  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/todos')
      if (response.ok) {
        const todosData = await response.json()
        setTodos(todosData)
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim() || submitting) return

    try {
      setSubmitting(true)
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newTodo.trim() })
      })

      if (response.ok) {
        const todo = await response.json()
        setTodos(prev => [todo, ...prev])
        setNewTodo('')
      } else {
        throw new Error('Failed to add todo')
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
      alert('Failed to add todo. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, completed: !completed })
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(prev => 
          prev.map(todo => 
            todo.id === id ? updatedTodo : todo
          )
        )
      } else {
        throw new Error('Failed to update todo')
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
      alert('Failed to update todo. Please try again.')
    }
  }

  const deleteTodo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return

    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo.id !== id))
      } else {
        throw new Error('Failed to delete todo')
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
      alert('Failed to delete todo. Please try again.')
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your todos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Icy Todo App
          </h1>
          <p className="text-gray-600">
            Stay organized with persistent cloud storage
          </p>
          {totalCount > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {completedCount} of {totalCount} completed
            </div>
          )}
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newTodo.trim() || submitting}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        {/* Todos List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {todos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p>No todos yet. Add one above to get started!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {todos.map((todo) => (
                <li key={todo.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300 hover:border-indigo-500'
                      }`}
                    >
                      {todo.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    
                    <span className={`flex-1 ${
                      todo.completed 
                        ? 'text-gray-500 line-through' 
                        : 'text-gray-800'
                    }`}>
                      {todo.text}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </span>
                      
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Delete todo"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by Cloudflare KV • Data persists across sessions
          </p>
        </div>
      </div>
    </div>
  )
}