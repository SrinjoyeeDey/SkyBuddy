interface Env {
  AUDIO_BUCKET: R2Bucket;
  ACCOUNT_ID: string;
  BUCKET_NAME: string;
}

export default {
  async fetch(request, env): Promise<Response> {
    // Handle CORS for browser requests
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

    // Only allow POST requests for uploads
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const formData = await request.formData();
      const file = formData.get("file");
      const path = formData.get("path") as string;
      
      if (!file || typeof file === "string") {
        return new Response(
          JSON.stringify({ error: "No file provided" }), 
          { 
            status: 400, 
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            } 
          }
        );
      }

      // Now TypeScript knows 'file' is a File object
      // Upload the file to R2
      await env.AUDIO_BUCKET.put(path, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // Construct a CDN URL for the file
      // Replace with your actual domain if using Cloudflare R2 with a custom domain
      const cdnUrl = `https://pub-${env.ACCOUNT_ID}.r2.dev/${env.BUCKET_NAME}/${path}`;
      // Or if using a custom domain with R2:
      // const cdnUrl = `https://cdn.yourdomain.com/${path}`;

      return new Response(
        JSON.stringify({
          success: true,
          cdnUrl,
          fileName: file.name,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error" 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
} satisfies ExportedHandler<Env>;