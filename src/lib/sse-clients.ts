/**
 * SHARED SSE CLIENT REGISTRY
 * 
 * Provides a singleton to track active SSE connections across all API routes.
 * This ensures that a broadcast from 'POST /api/stock-requests' reaches 
 * the 'GET /api/stock-requests/stream' connection regardless of module 
 * re-evaluation or route fragmentation in Next.js.
 * 
 * IMPORTANT: Do NOT import next/headers or any server-only modules here.
 */

class SSEManager {
    // We use a Set of controllers to broadcast to all active listeners
    private clients = new Set<ReadableStreamDefaultController>();

    /**
     * Add a new connection to the registry.
     */
    addClient(controller: ReadableStreamDefaultController) {
        this.clients.add(controller);
        // Send initial connection event
        this.sendEvent(controller, "init", { connected: true, timestamp: new Date().toISOString() });
    }

    /**
     * Remove a connection from the registry.
     */
    removeClient(controller: ReadableStreamDefaultController) {
        this.clients.delete(controller);
    }

    /**
     * Broadcast a message to all connected clients.
     */
    broadcast(event: string, data: any) {
        const payload = JSON.stringify(data);
        const chunk = `event: ${event}\ndata: ${payload}\n\n`;
        const encoder = new TextEncoder();
        const encodedChunk = encoder.encode(chunk);

        this.clients.forEach((controller) => {
            try {
                controller.enqueue(encodedChunk);
            } catch (err) {
                // If it fails, the client likely disconnected
                this.removeClient(controller);
            }
        });
    }

    /**
     * Internal helper to send a targeted event to a specific controller.
     */
    private sendEvent(controller: ReadableStreamDefaultController, event: string, data: any) {
        try {
            const payload = JSON.stringify(data);
            const chunk = `event: ${event}\ndata: ${payload}\n\n`;
            controller.enqueue(new TextEncoder().encode(chunk));
        } catch (err) {
            this.removeClient(controller);
        }
    }

    /**
     * Get active client count.
     */
    get clientCount() {
        return this.clients.size;
    }
}

// Global singleton instance
export const sseManager = new SSEManager();
