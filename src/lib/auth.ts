/**
 * CLIENT-SAFE auth helpers.
 * Only uses localStorage — safe to import in client components.
 * For server-side session verification in API routes, use @/lib/auth-server instead.
 */

const AUTH_KEY = "pwx_authenticated";
const ROLE_KEY = "pwx_role";

export type UserRole = "admin" | "co-admin" | "user";

export async function login(email: string, password: string): Promise<boolean> {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Invalid credentials");
    }

    const data = await res.json();

    // localStorage hints for client-side layout (role-gating, auth redirect)
    // Real security relies on the HttpOnly cookie set by the API
    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(ROLE_KEY, data.role || "user");
    }

    return true;
}

export async function logout(): Promise<void> {
    try {
        await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
        console.error("Logout request failed", e);
    }

    if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(ROLE_KEY);
    }
}

export function isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
        return localStorage.getItem(AUTH_KEY) === "true";
    }
    return false;
}

export function getRole(): UserRole {
    if (typeof window !== "undefined") {
        const role = localStorage.getItem(ROLE_KEY);
        if (role === "admin" || role === "co-admin" || role === "user") return role as UserRole;
    }
    return "user";
}
