import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/db";

export async function GET() {
    try {
        const stats = await getDashboardSummary();
        return NextResponse.json(stats);
    } catch (error) {
        console.error("Dashboard Stats API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
