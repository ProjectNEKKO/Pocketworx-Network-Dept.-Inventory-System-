"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Plus, Search, Minus, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useClientRole } from "@/lib/use-client-role";
import { addRequest } from "@/lib/stock-requests";
import { AddGatewaysDialog, GatewayItem } from "./add_gateways";

function GatewayDetailDialog({
    gw,
    open,
    onClose,
    onUpdate,
    role,
}: {
    gw: GatewayItem | null;
    open: boolean;
    onClose: () => void;
    onUpdate: (id: string, newQty: number, imageUrl?: string, newName?: string) => void;
    role: string;
}) {
    const [inputValue, setInputValue] = useState<string>("");
    const [nameValue, setNameValue] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const [reqQty, setReqQty] = useState<string>("1");
    const [submitted, setSubmitted] = useState(false);

    const [prevGw, setPrevGw] = useState<GatewayItem | null>(null);
    const [prevOpen, setPrevOpen] = useState<boolean>(false);

    if (gw !== prevGw || open !== prevOpen) {
        setPrevGw(gw);
        setPrevOpen(open);
        if (gw && open) {
            setInputValue(gw.quantity.toString());
            setNameValue(gw.name);
            setImageUrl(gw.image);
            setReqQty("1");
            setSubmitted(false);
        }
    }

    const currentQty = parseInt(inputValue, 10);
    const safeQty = isNaN(currentQty) ? 0 : Math.max(0, currentQty);

    function handleIncrement() { setInputValue((safeQty + 1).toString()); }
    function handleDecrement() { setInputValue(Math.max(0, safeQty - 1).toString()); }
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (/^\d*$/.test(e.target.value)) setInputValue(e.target.value);
    }

    function handleSave() {
        if (!gw) return;
        onUpdate(gw.sku, safeQty, imageUrl, nameValue);
        onClose();
    }

    async function handleSendRequest() {
        if (!gw) return;
        const qty = parseInt(reqQty, 10);
        if (isNaN(qty) || qty <= 0) return;
        const result = await addRequest({ type: "gateway", itemSku: gw.sku, itemName: gw.name, requestedQty: qty });
        if (result) setSubmitted(true);
    }

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) setImageUrl(URL.createObjectURL(file));
    }

    function handleOpenChange(o: boolean) {
        if (!o) { setInputValue(""); setNameValue(""); onClose(); }
    }

    if (!gw) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent 
                className="sm:max-w-[400px] text-black p-0 overflow-hidden rounded-[20px] border border-neutral-200/60 shadow-xl bg-white mx-auto w-[90vw]"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* Image area */}
                <div className="p-2.5 pb-0">
                    <div className="relative group flex h-48 w-full items-center justify-center rounded-[16px] bg-neutral-100/60 overflow-hidden border border-neutral-200/50">
                        {imageUrl ? (
                            <img src={imageUrl} alt={gw.name} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-neutral-400">
                                <Radio className="h-14 w-14 opacity-80" strokeWidth={1.5} />
                            </div>
                        )}
                        {role === "admin" && (
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white backdrop-blur-[2px]">
                                <Upload className="h-6 w-6 mb-1.5 drop-shadow-md" />
                                <span className="text-xs font-medium drop-shadow-md">Upload</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Detail body */}
                <div className="px-5 sm:px-6 py-5 space-y-5">
                    {/* Header Info */}
                    <div className="space-y-2.5">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-900 leading-tight tracking-tight text-left">
                                {role === "admin" ? (
                                    <input
                                        type="text"
                                        value={nameValue}
                                        onChange={(e) => setNameValue(e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-blue-500 focus:outline-none transition-colors py-0.5 truncate"
                                        placeholder="Gateway Name"
                                    />
                                ) : (
                                    gw.name
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/60">{gw.sku}</span>
                            <span className="text-[11px] text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/60">{gw.location}</span>
                            <Badge variant="secondary" className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-100/50">
                                Gateway
                            </Badge>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Current Qty</span>
                        <span className="font-semibold text-neutral-900 text-base">{gw.quantity} <span className="text-xs text-neutral-400 font-normal">units</span></span>
                    </div>

                    {/* ── ADMIN / CO-ADMIN: full qty editor ── */}
                    {(role === "admin" || role === "co-admin") && (
                        <>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-neutral-900">Adjust Quantity</span>
                                    {inputValue === "" && (
                                        <span className="text-[10px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Invalid</span>
                                    )}
                                </div>
                                <div className="flex items-center p-1 rounded-xl border border-neutral-200 bg-white shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/10">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-neutral-100 text-neutral-600" onClick={handleDecrement} disabled={safeQty <= 0}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input type="text" inputMode="numeric" value={inputValue} onChange={handleInputChange} className="flex-1 text-center text-lg font-bold border-0 focus-visible:ring-0 shadow-none px-2 h-9 bg-transparent" />
                                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-neutral-100 text-neutral-600" onClick={handleIncrement}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2.5 pt-1">
                                <Button variant="ghost" className="flex-1 h-10 rounded-lg text-neutral-600 hover:bg-neutral-100 text-sm font-medium" onClick={onClose}>Cancel</Button>
                                <Button className="flex-[1.5] h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md" onClick={handleSave} disabled={inputValue === ""}>
                                    Save Changes
                                </Button>
                            </div>
                        </>
                    )}

                    {/* ── USER: withdrawal request form ── */}
                    {role === "user" && (
                        submitted ? (
                            <div className="flex flex-col items-center gap-3 py-4 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p className="text-sm font-semibold text-neutral-900">Request Sent!</p>
                                <p className="text-xs text-neutral-500">The administrator will review your withdrawal request shortly.</p>
                                <Button variant="ghost" className="mt-1 h-9 text-sm" onClick={onClose}>Close</Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-neutral-900">Request Withdrawal Qty</span>
                                        <span className="text-xs text-neutral-400">Available: {gw.quantity} units</span>
                                    </div>
                                    <div className="flex items-center p-1 rounded-xl border border-neutral-200 bg-white shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/10">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-neutral-100 text-neutral-600"
                                            onClick={() => setReqQty(q => Math.max(1, parseInt(q || "1") - 1).toString())}
                                            disabled={parseInt(reqQty || "1") <= 1}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input type="text" inputMode="numeric" value={reqQty}
                                            onChange={(e) => { if (/^\d*$/.test(e.target.value)) setReqQty(e.target.value); }}
                                            className="flex-1 text-center text-lg font-bold border-0 focus-visible:ring-0 shadow-none px-2 h-9 bg-transparent" />
                                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-neutral-100 text-neutral-600"
                                            onClick={() => setReqQty(q => (parseInt(q || "0") + 1).toString())}
                                            disabled={parseInt(reqQty || "0") >= gw.quantity}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 text-center">Your request will be sent to the admin for approval.</p>
                                </div>
                                <div className="flex gap-2.5 pt-1">
                                    <Button variant="ghost" className="flex-1 h-10 rounded-lg text-neutral-600 hover:bg-neutral-100 text-sm font-medium" onClick={onClose}>Cancel</Button>
                                    <Button
                                        className="flex-[1.5] h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md"
                                        onClick={handleSendRequest}
                                        disabled={!reqQty || parseInt(reqQty) <= 0 || parseInt(reqQty) > gw.quantity}
                                    >
                                        Send Request
                                    </Button>
                                </div>
                            </>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function GatewaysPage() {
    const { role } = useClientRole();
    const [gateways, setGateways] = useState<GatewayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");
    const [selectedGw, setSelectedGw] = useState<GatewayItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchGateways = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/inventory/gateways");
            if (res.ok) {
                const data = await res.json();
                setGateways(data);
            }
        } catch (error) {
            console.error("Failed to fetch gateways:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGateways();
    }, []);

    const handleRowClick = (gw: GatewayItem) => {
        setSelectedGw(gw);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedGw(null);
    };

    const handleAddGateway = async (newGw: GatewayItem) => {
        try {
            const res = await fetch("/api/inventory/gateways", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newGw),
            });
            if (res.ok) fetchGateways();
        } catch (error) {
            console.error("Failed to add gateway:", error);
        }
    };

    const handleUpdate = async (sku: string, newQty: number, imageUrl?: string, newName?: string) => {
        try {
            const res = await fetch("/api/inventory/gateways", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sku, quantity: newQty, image: imageUrl, name: newName }),
            });
            if (res.ok) fetchGateways();
        } catch (error) {
            console.error("Failed to update gateway:", error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, sku: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this gateway?")) return;
        try {
            const res = await fetch(`/api/inventory/gateways?sku=${sku}`, {
                method: "DELETE",
            });
            if (res.ok) fetchGateways();
        } catch (error) {
            console.error("Failed to delete gateway:", error);
        }
    };

    const filtered = gateways.filter(g => {
        const name = g.name || "";
        const sku = g.sku || "";
        const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                              sku.toLowerCase().includes(search.toLowerCase());
        const matchesWarehouse = warehouseFilter === "All Warehouses" || g.location === warehouseFilter;
        return matchesSearch && matchesWarehouse;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Gateways
                    </h1>
                    <p className="mt-1 text-neutral-500">
                        Manage and monitor your gateway devices
                    </p>
                </div>
                {role === "admin" && (
                    <AddGatewaysDialog 
                        onAdd={handleAddGateway} 
                        existingSkus={gateways.map(g => g.sku)} 
                    />
                )}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search gateways by name or SKU..."
                        className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500 w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] border-neutral-200 bg-white text-neutral-900">
                        <SelectValue placeholder="All Warehouses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-neutral-200 text-neutral-900 z-50">
                        <SelectItem value="All Warehouses" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">All Warehouses</SelectItem>
                        <SelectItem value="PWX IoT Hub" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">PWX IoT Hub</SelectItem>
                        <SelectItem value="Jenny's" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">Jenny&apos;s</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Gateway List */}
            <Card className="border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900">All Gateways</CardTitle>
                    <CardDescription className="text-neutral-500">
                        {filtered.length} gateways registered
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filtered.map((gw) => (
                            <div
                                key={gw.sku}
                                className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 transition-all hover:bg-blue-50/40 hover:border-blue-200 hover:shadow-sm cursor-pointer select-none"
                                onClick={() => handleRowClick(gw)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors overflow-hidden border border-blue-100/50">
                                        {gw.image ? (
                                            <img src={gw.image} alt={gw.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Radio className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">{gw.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 rounded">{gw.sku}</span>
                                            <span className="text-xs text-neutral-500">{gw.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden text-right sm:block">
                                        <p className="text-xs text-neutral-500 mb-0.5">Quantity: <span className="font-medium text-neutral-700">{gw.quantity}</span></p>
                                    </div>
                                    {role === "admin" && (
                                        <button
                                            onClick={(e) => handleDelete(e, gw.sku)}
                                            className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            title="Delete gateway"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <GatewayDetailDialog
                gw={selectedGw}
                open={dialogOpen}
                onClose={handleCloseDialog}
                onUpdate={handleUpdate}
                role={role}
            />
        </div>
    );
}
