import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getInventoryComponents, upsertComponent, deleteComponent, updateComponent } from "@/lib/db";

export async function GET() {
    try {
        const components = await getInventoryComponents();
        return NextResponse.json(components);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch components" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const newItem = await upsertComponent(body);
        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add component" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { sku, warehouse, ...updates } = body;
        
        if (!sku) return NextResponse.json({ error: "Missing SKU" }, { status: 400 });

        const updatedItem = await updateComponent(sku, warehouse, updates);
        return NextResponse.json(updatedItem);
    } catch (error: any) {
        console.error("Failed to update component API:", error.message);
        return NextResponse.json({ error: error.message || "Failed to update component" }, { status: 500 });
    }
}


export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const sku = searchParams.get("sku");
        const warehouse = searchParams.get("warehouse");
        if (!sku || !warehouse) return NextResponse.json({ error: "Missing params" }, { status: 400 });

        await deleteComponent(sku, warehouse);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete component" }, { status: 500 });
    }
}
