import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    // Nullify the current HttpOnly cookie by forcing it into expiration correctly
    const cookieStore = await cookies();
    cookieStore.delete("pwx_auth_token");
    
    return NextResponse.json({ message: "Success. User securely unauthenticated." }, { status: 200 });
}
