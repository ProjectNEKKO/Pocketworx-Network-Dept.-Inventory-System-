const AUTH_KEY = "pwx_authenticated";

export async function login(email: string, password: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate basic backend validation
    if (password === "wrong") {
        throw new Error("Invalid email or password");
    }

    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, "true");
    }
    return true;
}

export function logout(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_KEY);
    }
}

export function isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
        return localStorage.getItem(AUTH_KEY) === "true";
    }
    return false;
}
