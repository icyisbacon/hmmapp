export async function onRequestGet(context) {
    const { env } = context
    const list = await env.TODOS_KV.list()
    const todos = []
    for (const key of list.keys) {
      const value = await env.TODOS_KV.get(key.name, { type: "json" })
      todos.push(value)
    }
    return new Response(JSON.stringify(todos), {
      headers: { "Content-Type": "application/json" },
    })
  }
  
  export async function onRequestPost(context) {
    const { request, env } = context
    const data = await request.json()
    const id = crypto.randomUUID()
    const todo = { id, ...data }
    await env.TODOS_KV.put(id, JSON.stringify(todo))
    return new Response(JSON.stringify(todo), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    })
  }
  
  export async function onRequestDelete(context) {
    const { request, env } = context
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 })
    }
    await env.TODOS_KV.delete(id)
    return new Response(JSON.stringify({ success: true }))
  }
  