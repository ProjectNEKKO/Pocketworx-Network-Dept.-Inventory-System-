"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, X, Package, Radio, RefreshCw, AlertCircle, Info, CheckCheck } from "lucide-react";
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
    loadNotifications,
    markAllNotificationsRead,
} from "@/lib/stock-requests";
import { useClientRole } from "@/lib/use-client-role";
import { toast } from "sonner";

// ── Format relative time ──
function relativeTime(iso: string) {
    if (!iso) return "a long time ago";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationPanel() {
    const { role, ready } = useClientRole();
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState<StockRequest[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    const isAdmin = role === "admin" || role === "co-admin";

    const refresh = useCallback(async () => {
        try {
            const [reqData, notifData] = await Promise.all([
                loadRequests(),
                loadNotifications()
            ]);
            setRequests(reqData);
            setNotifications(notifData);
        } catch {
            // silently ignore — polling will retry
        }
    }, []);

    // ── SSE for instant push + polling as fallback ──
    useEffect(() => {
        if (!ready) return;

        // Initial fetch
        refresh();

        let es: EventSource | null = null;
        if (typeof window !== "undefined" && window.EventSource) {
            es = new EventSource("/api/stock-requests/stream");
            eventSourceRef.current = es;

            es.addEventListener("init", () => {
                refresh();
            });

            es.addEventListener("refresh", () => {
                refresh();
                if (isAdmin) {
                    toast.info("New inventory notification received!", {
                        description: "Check the notification panel for updates.",
                        duration: 5000,
                    });
                }
            });

            es.onerror = () => {
                if (es) es.close();
                eventSourceRef.current = null;
            };
        }

        // Fallback polling every 5s
        const pollId = setInterval(refresh, 5_000);

        return () => {
            if (es) es.close();
            eventSourceRef.current = null;
            clearInterval(pollId);
        };
    }, [ready, isAdmin, refresh]);

    // Refresh on open
    useEffect(() => {
        if (open) refresh();
    }, [open, refresh]);

    const pendingRequests = requests.filter((r) => r.status === "pending");
    const unreadCount = pendingRequests.length + notifications.filter(n => !n.is_read).length;

    async function handleAccept(req: StockRequest) {
        setIsLoading(true);
        try {
            const { success, error } = await updateRequestStatus(req.id, "accepted");
            if (success) {
                toast.success("Request accepted and inventory updated.");
                await refresh();
            } else {
                toast.error(error || "Failed to accept request. Check stock levels.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to accept request.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDecline(req: StockRequest) {
        setIsLoading(true);
        try {
            const { success, error } = await updateRequestStatus(req.id, "declined");
            if (success) {
                toast.success("Request declined.");
                await refresh();
            } else {
                toast.error(error || "Failed to decline request.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to decline request.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleMarkAllRead() {
        setIsLoading(true);
        try {
            const success = await markAllNotificationsRead();
            if (success) {
                toast.success("All notifications marked as read");
                await refresh();
            } else {
                toast.error("Failed to mark notifications as read");
            }
        } catch (error) {
            toast.error("Error marking notifications as read");
        } finally {
            setIsLoading(false);
        }
    }

    if (!ready) return null;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-neutral-100 transition-all text-neutral-500 hover:text-neutral-900 group"
                    title="Notifications"
                >
                    <Bell className="h-5 w-5 transition-transform group-active:scale-90" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md bg-white border-l border-neutral-200 p-0 flex flex-col shadow-2xl"
            >
                <SheetHeader className="px-5 py-5 border-b border-neutral-100 shrink-0 bg-neutral-50/30">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-bold text-neutral-900">
                            Notifications
                        </SheetTitle>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Badge className="bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
                                    {unreadCount} new
                                </Badge>
                            )}
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={isLoading}
                                    className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 transition-colors disabled:opacity-50"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={refresh}
                                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
                    {requests.length === 0 && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 py-24 text-neutral-400">
                            <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center mb-1">
                                <Bell className="h-6 w-6 opacity-20" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium">No notifications yet</p>
                            <p className="text-xs text-neutral-400">We&apos;ll notify you when things change.</p>
                        </div>
                    )}

                    {/* Stock Requests (Highest priority for Admins) */}
                    {[
                        ...requests.filter((r) => r.status === "pending"),
                        ...requests.filter((r) => r.status !== "pending"),
                    ].map((req) => (
                        <div key={`req-${req.id}`} className={`px-5 py-5 space-y-4 transition-colors ${req.status === 'pending' ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                        req.type === 'component' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {req.type === "component"
                                            ? <Package className="h-5 w-5" />
                                            : <Radio className="h-5 w-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-neutral-900 truncate">
                                            {req.itemName}
                                        </p>
                                        <p className="text-[11px] text-neutral-500 font-mono tracking-tight">{req.itemSku}</p>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
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

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[13px]">
                                    <span className="text-neutral-600">
                                        <span className="font-semibold text-neutral-900">{req.requestedBy}</span>
                                        {" requested "}
                                        <span className="font-bold text-red-600">−{req.requestedQty} pcs</span>
                                    </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 font-medium">{relativeTime(req.createdAt)}</p>
                            </div>

                            {req.status === "pending" && isAdmin && (
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        size="sm"
                                        disabled={isLoading}
                                        className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                                        onClick={() => handleAccept(req)}
                                    >
                                        <Check className="h-4 w-4 mr-1.5" />
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={isLoading}
                                        className="flex-1 h-9 text-xs border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg"
                                        onClick={() => handleDecline(req)}
                                    >
                                        <X className="h-4 w-4 mr-1.5" />
                                        Decline
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Generic Notifications */}
                    {notifications.map((notif) => (
                        <div key={`notif-${notif.id}`} className="px-5 py-4 flex gap-4 hover:bg-neutral-50 transition-colors">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                notif.type === 'low_stock' ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                                {notif.type === 'low_stock' ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm font-semibold text-neutral-900 leading-tight mb-1">{notif.message}</p>
                                <p className="text-[11px] text-neutral-400 font-medium">{relativeTime(notif.created_at)}</p>
                            </div>
                            {!notif.is_read && (
                                <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
