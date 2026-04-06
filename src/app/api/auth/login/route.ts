import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { z } from "zod";

// MUST securely reside in `.env` in production architectures
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "super-secret-fallback-key-for-development"
);

// Very simple in-memory rate limiting implementation for single-process environments
// NOTE: Production multi-instance deployments require Redis / DB-backed rate limit maps.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const MAX_ATTEMPTS = 100; // Increased for local testing convenience
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

        // 1. Rate Limiting Check to prevent brute force
        const now = Date.now();
        const record = rateLimitMap.get(ip) || { count: 0, windowStart: now };

        if (now - record.windowStart > WINDOW_MS) {
            record.count = 0;
            record.windowStart = now;
        }

        if (record.count >= MAX_ATTEMPTS) {
            console.warn(`[SECURITY ALERT] IP Account Lockout threshold reached for: ${ip}`);
            // Rate limit warning
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();

        // 2. Validate input syntactically without processing directly
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            record.count += 1;
            rateLimitMap.set(ip, record);
            console.warn(`[SECURITY ALERT] Malformed payload received from IP: ${ip}`);
            // Generic Error response
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const { email, password } = result.data;

        // 3. Perform the Data check (Parameter-safe implicitly abstracting the in-memory array)
        console.log(`[AUTH] Attempting login for email: ${email}`);
        const user = await getUserByEmail(email);
        if (!user) {
            record.count += 1;
            rateLimitMap.set(ip, record);
            console.warn(`[AUTH] Failed lookup: Account not found for email: ${email}`);
            // Generic Error for production, more specific for debugging
            return NextResponse.json(
                { error: process.env.NODE_ENV === "development" ? "Account not found" : "Invalid credentials" }, 
                { status: 401 }
            );
        }

        // 4. Secure Password execution via strict timing cryptography (bcrypt)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            record.count += 1;
            rateLimitMap.set(ip, record);
            console.warn(`[AUTH] Invalid password attempt trace against email: ${email}`);
            // Generic Error for production, more specific for debugging
            return NextResponse.json(
                { error: process.env.NODE_ENV === "development" ? "Incorrect password" : "Invalid credentials" }, 
                { status: 401 }
            );
        }

        console.log(`[AUTH] Successfully authenticated user: ${email} (Role: ${user.role})`);

        // Pass! Clear limits and log success
        rateLimitMap.delete(ip);

        // 5. Build JSON Web Token explicitly
        const token = await new SignJWT({ userId: user.id, role: user.role, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(JWT_SECRET);

        // 6. Provide the critical payload strictly to HttpOnly constraints
        const cookieStore = await cookies();
        cookieStore.set("pwx_auth_token", token, {
            httpOnly: true,  // Critical configuration hiding value from XSS attack vectors
            secure: process.env.NODE_ENV === "production", // Transport solely through TLS context layer
            sameSite: "strict", // Deter CSRF mutations
            path: "/",
            maxAge: 24 * 60 * 60, // Lasts 24 hours
        });

        // Resolve successful status without communicating vulnerable session credentials
        return NextResponse.json(
            { message: "Login successful", role: user.role },
            { status: 200 }
        );
    } catch (error) {
        console.error("[CRITICAL SYSTEM ERROR] Authenticator POST Exception Pipeline:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
