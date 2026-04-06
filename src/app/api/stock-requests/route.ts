import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { createStockRequest, getStockRequests, createNotification, logActivity } from "@/lib/db";
import { sseManager } from "@/lib/sse-clients";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let requests = await getStockRequests();
        
        // Filter for specific user if not admin
        if (session.role !== 'admin' && session.role !== 'co-admin') {
            requests = requests.filter(r => r.requested_by.toLowerCase() === session.email.toLowerCase());
        }
        
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, itemSku, itemName, requestedQty } = await request.json();
        const newRequest = await createStockRequest(type, itemSku, itemName, requestedQty, session.email);
        await logActivity("Stock Requested", `${requestedQty}x ${itemName} requested`, session.email, itemSku);
        // Push an instant SSE event to all connected admin/co-admin browsers
        sseManager.broadcast("refresh", newRequest);
        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }
}
