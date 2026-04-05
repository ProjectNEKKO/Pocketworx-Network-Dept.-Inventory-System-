import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUserByEmail } from "@/lib/db";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getUserByEmail(session.email);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return the essential profile fields
        return NextResponse.json({
            name: user.name || "User",
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("GET /api/auth/me error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
