"use client";

export type StockRequest = {
  id: string;
  type: "component" | "gateway";
  itemSku: string;
  itemName: string;
  requestedQty: number;
  requestedBy: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

const STORAGE_KEY = "pwx_stock_requests";

export function loadRequests(): StockRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StockRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveRequests(requests: StockRequest[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function addRequest(
  payload: Omit<StockRequest, "id" | "status" | "createdAt">
): StockRequest {
  const req: StockRequest = {
    ...payload,
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const all = loadRequests();
  saveRequests([...all, req]);
  return req;
}

export function updateRequestStatus(
  id: string,
  status: "accepted" | "declined"
): void {
  const all = loadRequests();
  saveRequests(all.map((r) => (r.id === id ? { ...r, status } : r)));
}

export function getPendingCount(): number {
  return loadRequests().filter((r) => r.status === "pending").length;
}
