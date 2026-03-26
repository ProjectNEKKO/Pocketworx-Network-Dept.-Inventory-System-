"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, X, Package, Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    StockRequest,
    loadRequests,
    updateRequestStatus,
} from "@/lib/stock-requests";
import { loadComponentCatalog, saveComponentCatalog } from "@/lib/inventory-catalog";
import { COMPONENT_CATALOG_SEED } from "@/data/components-seed";

// ── Gateway catalog helpers (mirror the gateway page's localStorage key) ──
const GATEWAY_KEY = "pwx_gateway_catalog";

function loadGatewayCatalog() {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(GATEWAY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveGatewayCatalog(items: object[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(GATEWAY_KEY, JSON.stringify(items));
}

// ── Format relative time ──
function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function AdminRequestPanel() {
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState<StockRequest[]>([]);

    const refresh = useCallback(() => {
        setRequests(loadRequests());
    }, []);

    useEffect(() => {
        refresh();
        // Poll every 10 s so badge updates without a page reload
        const id = setInterval(refresh, 10_000);
        return () => clearInterval(id);
    }, [refresh]);

    useEffect(() => {
        if (open) refresh();
    }, [open, refresh]);

    const pending = requests.filter((r) => r.status === "pending");

    function handleAccept(req: StockRequest) {
        if (req.type === "component") {
            const catalog = loadComponentCatalog(COMPONENT_CATALOG_SEED);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const next = catalog.map((c: any) =>
                c.sku === req.itemSku
                    ? { ...c, stock: Math.max(0, c.stock - req.requestedQty) }
                    : c
            );
            saveComponentCatalog(next);
        } else {
            const catalog = loadGatewayCatalog();
            const next = catalog.map((g: { sku: string; quantity: number }) =>
                g.sku === req.itemSku
                    ? { ...g, quantity: Math.max(0, g.quantity - req.requestedQty) }
                    : g
            );
            saveGatewayCatalog(next);
        }
        updateRequestStatus(req.id, "accepted");
        refresh();
    }

    function handleDecline(req: StockRequest) {
        updateRequestStatus(req.id, "declined");
        refresh();
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-900"
                    title="Withdrawal Requests"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    {pending.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                            {pending.length > 9 ? "9+" : pending.length}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md bg-white border-l border-neutral-200 p-0 flex flex-col"
            >
                <SheetHeader className="px-5 py-4 border-b border-neutral-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-base font-bold text-neutral-900">
                            Withdrawal Requests
                        </SheetTitle>
                        <div className="flex items-center gap-2">
                            {pending.length > 0 && (
                                <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 h-auto">
                                    {pending.length} pending
                                </Badge>
                            )}
                            <button
                                onClick={refresh}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
                    {requests.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                            <Bell className="h-10 w-10 opacity-30" strokeWidth={1.5} />
                            <p className="text-sm font-medium">No requests yet</p>
                        </div>
                    )}

                    {/* Pending first, then resolved */}
                    {[
                        ...requests.filter((r) => r.status === "pending"),
                        ...requests.filter((r) => r.status !== "pending"),
                    ].map((req) => (
                        <div key={req.id} className="px-5 py-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                                        {req.type === "component"
                                            ? <Package className="h-4 w-4 text-violet-600" />
                                            : <Radio className="h-4 w-4 text-blue-600" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-neutral-900 truncate">
                                            {req.itemName}
                                        </p>
                                        <p className="text-[11px] text-neutral-500 font-mono">{req.itemSku}</p>
                                    </div>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        req.status === "pending"
                                            ? "text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                                            : req.status === "accepted"
                                            ? "text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "text-[10px] bg-neutral-100 text-neutral-500 border-neutral-200"
                                    }
                                >
                                    {req.status}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between text-xs text-neutral-500">
                                <span>
                                    <span className="font-medium text-neutral-700">{req.requestedBy}</span>
                                    {" · "}requested{" "}
                                    <span className="font-bold text-neutral-900">−{req.requestedQty} pcs</span>
                                </span>
                                <span>{relativeTime(req.createdAt)}</span>
                            </div>

                            {req.status === "pending" && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleAccept(req)}
                                    >
                                        <Check className="h-3.5 w-3.5 mr-1" />
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleDecline(req)}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Decline
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
