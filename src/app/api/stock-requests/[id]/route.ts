import { NextResponse } from "next/server";
import { updateStockRequestStatus } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

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
        await updateStockRequestStatus(parseInt(id), status);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update request status" }, { status: 500 });
    }
}
