const AUTH_KEY = "pwx_authenticated";
const ROLE_KEY = "pwx_role";

export type UserRole = "admin" | "co-admin" | "user";

export async function login(email: string, password: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate basic backend validation
    if (password === "wrong") {
        throw new Error("Invalid email or password");
    }

    // Assign role: emails containing "admin" → admin, everything else → user
    const lowerEmail = email.toLowerCase();
    const role: UserRole = lowerEmail.includes("co-admin") || lowerEmail.includes("coadmin")
        ? "co-admin"
        : lowerEmail.includes("admin")
        ? "admin"
        : "user";

    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(ROLE_KEY, role);
    }
    return true;
}

export function logout(): void {
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
        if (role === "admin" || role === "co-admin" || role === "user") return role;
    }
    return "user";
}
