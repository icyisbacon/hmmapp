export async function onRequestPost(context) {
    const { request, env } = context;
    const data = await request.json();
    const id = crypto.randomUUID();
    
    // Add createdAt timestamp
    const todo = { id, ...data, createdAt: data.createdAt || new Date().toISOString() };
    
    await env.TODOS_KV.put(id, JSON.stringify(todo));
    
    return new Response(JSON.stringify(todo), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  }
  