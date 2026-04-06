import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getGateways, upsertGateway, deleteGateway, logActivity } from "@/lib/db";

export async function GET() {
    try {
        const gateways = await getGateways();
        return NextResponse.json(gateways);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch gateways" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const newGw = await upsertGateway(body);
        await logActivity("Gateway Registered", `${newGw.name} — ${newGw.location}`, session.email, newGw.sku);
        return NextResponse.json(newGw);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add gateway" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const updatedGw = await upsertGateway(body);
        await logActivity("Gateway Updated", `${updatedGw.name} updated properties`, session.email, updatedGw.sku);
        return NextResponse.json(updatedGw);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update gateway" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const sku = searchParams.get("sku");
        if (!sku) return NextResponse.json({ error: "Missing sku" }, { status: 400 });

        await deleteGateway(sku);
        await logActivity("Gateway Removed", `SKU: ${sku} removed`, session.email, sku);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete gateway" }, { status: 500 });
    }
}
