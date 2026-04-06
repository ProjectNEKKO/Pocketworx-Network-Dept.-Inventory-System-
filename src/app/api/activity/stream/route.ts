import { getSession } from "@/lib/auth-server";
import { sseManager } from "@/lib/sse-clients";

// This tells Next.js NOT to buffer or static-generate this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const stream = new ReadableStream({
        start(controller) {
            sseManager.addClient(controller);
            console.log(`[SSE DBG] New Activity Stream client connected. Total: ${sseManager.clientCount}`);
        },
        cancel(controller) {
            sseManager.removeClient(controller);
            console.log(`[SSE DBG] Activity Stream client disconnected. Total: ${sseManager.clientCount}`);
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive"
        }
    });
}
