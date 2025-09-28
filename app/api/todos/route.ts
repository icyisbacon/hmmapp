import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export async function GET() {
  try {
    const { env } = getRequestContext()
    const todoList = await env.TODOS_KV.list()
    
    const todos: Todo[] = []
    for (const key of todoList.keys) {
      const todoData = await env.TODOS_KV.get(key.name)
      if (todoData) {
        todos.push(JSON.parse(todoData))
      }
    }
    
    // Sort by creation date (newest first)
    todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return Response.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return Response.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext()
    const { text } = await request.json()
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return Response.json({ error: 'Todo text is required' }, { status: 400 })
    }
    
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    await env.TODOS_KV.put(todo.id, JSON.stringify(todo))
    
    return Response.json(todo, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return Response.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { env } = getRequestContext()
    const { id, text, completed } = await request.json()
    
    if (!id) {
      return Response.json({ error: 'Todo ID is required' }, { status: 400 })
    }
    
    const existingTodoData = await env.TODOS_KV.get(id)
    if (!existingTodoData) {
      return Response.json({ error: 'Todo not found' }, { status: 404 })
    }
    
    const existingTodo: Todo = JSON.parse(existingTodoData)
    
    const updatedTodo: Todo = {
      ...existingTodo,
      ...(text !== undefined && { text: text.trim() }),
      ...(completed !== undefined && { completed })
    }
    
    await env.TODOS_KV.put(id, JSON.stringify(updatedTodo))
    
    return Response.json(updatedTodo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return Response.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return Response.json({ error: 'Todo ID is required' }, { status: 400 })
    }
    
    const existingTodoData = await env.TODOS_KV.get(id)
    if (!existingTodoData) {
      return Response.json({ error: 'Todo not found' }, { status: 404 })
    }
    
    await env.TODOS_KV.delete(id)
    
    return Response.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return Response.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}