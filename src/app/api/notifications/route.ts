import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUnreadNotifications, markAllNotificationsAsRead } from "@/lib/db";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await getUnreadNotifications(session.userId);
        return NextResponse.json(notifications || []);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await markAllNotificationsAsRead(session.userId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to mark notifications as read:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
