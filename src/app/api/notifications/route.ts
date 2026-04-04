import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUnreadNotifications } from "@/lib/db";

export async function GET() {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'co-admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await getUnreadNotifications();
        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
