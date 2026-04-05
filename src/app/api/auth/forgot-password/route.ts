import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        console.log(`[FORGOT PASSWORD] Reset request for: ${email}`);

        const user = await getUserByEmail(email);

        if (!user) {
            // For security, don't confirm if the user exists
            return NextResponse.json(
                { message: "If an account exists for this email, you will receive reset instructions." }, 
                { status: 200 }
            );
        }

        // TODO: In a real production system, generate a secure token, 
        // save it to the DB with an expiration, and send it via email.
        console.log(`[FORGOT PASSWORD] Token would be generated and emailed to: ${email}`);

        return NextResponse.json(
            { message: "If an account exists for this email, you will receive reset instructions." }, 
            { status: 200 }
        );
    } catch (error) {
        console.error("[CRITICAL SYSTEM ERROR] Forgot Password POST Exception Pipeline:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
