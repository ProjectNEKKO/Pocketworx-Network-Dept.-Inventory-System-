import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { adjustGatewayQuantity, logActivity } from "@/lib/db";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { sku, delta } = await request.json();
        
        if (!sku || typeof delta !== 'number') {
            return NextResponse.json({ error: "Missing required fields: sku and delta" }, { status: 400 });
        }

        const updatedGw = await adjustGatewayQuantity(sku, delta);
        await logActivity("Gateway Adjusted", `${updatedGw.name} quantity increased by ${delta}`, session.email, updatedGw.sku);
        return NextResponse.json(updatedGw);
    } catch (error: any) {
        console.error("[API_ADJUST_GATEWAY_ERROR]", error.message);
        return NextResponse.json({ error: error.message || "Failed to adjust gateway quantity" }, { status: 500 });
    }
}
