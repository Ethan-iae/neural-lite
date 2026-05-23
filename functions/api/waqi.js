export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const city = url.searchParams.get("city");

    if (!city) {
        return new Response(JSON.stringify({ error: "City is required" }), {
            headers: { "content-type": "application/json" },
            status: 400,
        });
    }

    const token = env.WAQI_API_KEY;
    
    if (!token) {
        return new Response(JSON.stringify({ error: "WAQI API Key not configured" }), {
            headers: { "content-type": "application/json" },
            status: 500,
        });
    }

    const targetUrl = `https://api.waqi.info/search/?keyword=${encodeURIComponent(city)}&token=${token}`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: {
                "content-type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
            headers: { "content-type": "application/json" },
            status: 500,
        });
    }
}