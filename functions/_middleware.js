export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);


  return await context.next();
}