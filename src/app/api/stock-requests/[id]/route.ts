import { NextResponse } from "next/server";
import { updateStockRequestStatus } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { sseManager } from "@/lib/sse-clients";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { status } = await request.json();
        const requestId = parseInt(id);
        await updateStockRequestStatus(requestId, status, session.email);
        
        // Broadcast the update so other admins' notification panels refresh instantly
        sseManager.broadcast("refresh", { id: requestId, status });
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update request status:", error.message);
        return NextResponse.json({ error: error.message || "Failed to update request status" }, { status: 400 });
    }
}
