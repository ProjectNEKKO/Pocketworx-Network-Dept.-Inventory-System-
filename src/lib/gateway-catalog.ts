import type { GatewayItem } from "@/app/(protected)/gateways/add_gateways";

export const GATEWAY_CATALOG_KEY = "pwx_gateway_catalog";

export const initialGateways: GatewayItem[] = [
    { id: "Gateway 915 Outdoor", sku: "GW-915-OA", location: "PWX IoT Hub", quantity: 1 },
    { id: "Gateway 868 Outdoor", sku: "GW-868-OA", location: "PWX IoT Hub", quantity: 2 },
    { id: "Gateway 915 Indoor", sku: "GW-915-IA", location: "PWX IoT Hub", quantity: 1 },
    { id: "Gateway 868 Indoor", sku: "GW-868-IA", location: "PWX IoT Hub", quantity: 5 },
    { id: "Femto Outdoor", sku: "GW-FM-OA", location: "PWX IoT Hub", quantity: 3 },
    { id: "Gateway 915 Outdoor", sku: "GW-915-OB", location: "Jenny's", quantity: 2 },
    { id: "Gateway 868 Outdoor", sku: "GW-868-OB", location: "Jenny's", quantity: 1 },
    { id: "Gateway 915 Indoor", sku: "GW-915-IB", location: "Jenny's", quantity: 3 },
    { id: "Gateway 868 Indoor", sku: "GW-868-IB", location: "Jenny's", quantity: 2 },
    { id: "Femto Outdoor", sku: "GW-FM-OB", location: "Jenny's", quantity: 1 },
];

export function loadGwCatalog(): GatewayItem[] {
    if (typeof window === "undefined") return initialGateways;
    try {
        const raw = localStorage.getItem(GATEWAY_CATALOG_KEY);
        if (!raw) return initialGateways;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return initialGateways;
        return parsed as GatewayItem[];
    } catch {
        return initialGateways;
    }
}

export function saveGwCatalog(items: GatewayItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(GATEWAY_CATALOG_KEY, JSON.stringify(items));
}
