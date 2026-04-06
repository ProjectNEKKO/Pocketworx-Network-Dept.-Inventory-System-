"use client";

export type StockRequest = {
  id: number | string;
  type: "component" | "gateway";
  itemSku: string;
  itemName: string;
  requestedQty: number;
  requestedBy: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export async function loadRequests(): Promise<StockRequest[]> {
  try {
    const res = await fetch("/api/stock-requests");
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((r: any) => ({
      id: r.id,
      type: r.type,
      itemSku: r.item_sku,
      itemName: r.item_name,
      requestedQty: r.requested_qty,
      requestedBy: r.requested_by,
      status: r.status,
      createdAt: r.created_at,
    }));
  } catch (error) {
    console.error("Failed to load requests:", error);
    return [];
  }
}

export async function addRequest(
  payload: Omit<StockRequest, "id" | "status" | "createdAt" | "requestedBy">
): Promise<StockRequest | null> {
  try {
    const res = await fetch("/api/stock-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to add request:", error);
    return null;
  }
}

export async function updateRequestStatus(
  id: number | string,
  status: "accepted" | "declined"
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/stock-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.error || "Failed to update status" };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message || "Failed to update status due to network error" };
  }
}

export async function loadNotifications(): Promise<any[]> {
  try {
    const res = await fetch("/api/notifications");
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function markNotificationRead(id: number | string): Promise<boolean> {
  try {
    const res = await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}
