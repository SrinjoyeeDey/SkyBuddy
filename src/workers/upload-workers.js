// workers/upload-worker.js
export default {
  async fetch(request, env) {
    // CORS for preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Handle actual upload
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const path = formData.get("path") || `uploads/${Date.now()}-${file.name}`;
        
        if (!file) {
          return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        
        // Upload to R2
        await env.AUDIO_BUCKET.put(path, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        });
        
        // Return CDN URL (customize with your domain)
        const cdnUrl = `https://cdn.skybuddy.app/${path}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            cdnUrl,
            fileName: file.name,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
          }
        );
      }
    }
    
    return new Response("Method not allowed", { status: 405 });
  }
};