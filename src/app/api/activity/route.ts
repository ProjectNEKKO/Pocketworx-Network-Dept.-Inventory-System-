import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getActivityLogs } from "@/lib/db";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const logs = await getActivityLogs();
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
    }
}
