import { NextRequest } from "next/server";
import { sseManager } from "@/lib/sse-clients";
import { getSession } from "@/lib/auth-server";
import { getStockRequests } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/stock-requests/stream
 * Handles the persistent SSE connection for admins to receive instant updates.
 */
export async function GET(req: NextRequest) {
    const session = await getSession();

    // 1. Auth check: Only admins/co-admins can listen to the stream
    if (!session || (session.role !== "admin" && session.role !== "co-admin")) {
        return new Response("Unauthorized", { status: 401 });
    }

    // 2. Setup the stream
    const responseStream = new ReadableStream({
        async start(controller) {
            // Keep-alive interval (prevents connection timeout)
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
                } catch {
                    // Client disconnected
                    sseManager.removeClient(controller);
                    clearInterval(keepAlive);
                }
            }, 15000);

            // Register this client with the global manager
            sseManager.addClient(controller);

            // Optional: Send initial data snapshot
            try {
                const rows = await getStockRequests();
                const pending = rows.filter((r: any) => r.status === "pending").length;
                const chunk = `event: init\ndata: ${JSON.stringify({ pending })}\n\n`;
                controller.enqueue(new TextEncoder().encode(chunk));
            } catch (err) {
                console.error("SSE Init error:", err);
            }

            // Cleanup on close
            req.signal.addEventListener("abort", () => {
                sseManager.removeClient(controller);
                clearInterval(keepAlive);
                try { controller.close(); } catch { /* already closed */ }
            });
        },
    });

    return new Response(responseStream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no", // disable Nginx buffering
        },
    });
}
