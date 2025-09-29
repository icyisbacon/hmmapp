export async function onRequestGet(context) {
    const { TODOS_KV } = context.env;
    const list = await TODOS_KV.list();
    const todos = await Promise.all(
      list.keys.map(async (key) => JSON.parse(await TODOS_KV.get(key.name)))
    );
    return Response.json(todos);
  }
  
  export async function onRequestPost(context) {
    const { TODOS_KV } = context.env;
    const { text } = await context.request.json();
    const id = crypto.randomUUID();
    const todo = { id, text, createdAt: new Date().toISOString() };
    await TODOS_KV.put(id, JSON.stringify(todo));
    return Response.json(todo, { status: 201 });
  }
  
  export async function onRequestDelete(context) {
    const { TODOS_KV } = context.env;
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
    if (id) {
      await TODOS_KV.delete(id);
      return new Response("Deleted", { status: 200 });
    }
    return new Response("Missing id", { status: 400 });
  }
  