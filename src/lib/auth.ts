const AUTH_KEY = "pwx_authenticated";

export function login(_username: string, _password: string): boolean {
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
