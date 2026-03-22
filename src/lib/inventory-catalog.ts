import type { ComponentItem } from "@/app/(protected)/components/add_components";

export const POCKETWORX_COMPONENTS_KEY = "pocketworx_components";

export function loadComponentCatalog(fallback: ComponentItem[]): ComponentItem[] {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(POCKETWORX_COMPONENTS_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
        return parsed as ComponentItem[];
    } catch {
        return fallback;
    }
}

export function saveComponentCatalog(items: ComponentItem[]): void {
    localStorage.setItem(POCKETWORX_COMPONENTS_KEY, JSON.stringify(items));
}
