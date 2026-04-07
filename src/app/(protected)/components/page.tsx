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
import { Cpu, Search, Plus, Minus, Package, Upload, Trash2, Download } from "lucide-react";
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
import { AddComponentsDialog, ComponentItem } from "./add_components";
import { addRequest } from "@/lib/stock-requests";
import { exportComponentsToExcel } from "@/lib/excel-import";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function getStatusInfo(stock: number, minStock: number) {
    if (stock <= 0) return { status: "Out of Stock", statusClasses: "border-red-200 bg-red-50 text-red-700", textClass: "text-red-700 font-bold" };
    if (stock <= minStock) return { status: "Critical", statusClasses: "border-orange-200 bg-orange-50 text-orange-700", textClass: "text-orange-700 font-bold" };
    if (stock <= minStock * 1.5) return { status: "Low", statusClasses: "border-amber-200 bg-amber-50 text-amber-700", textClass: "text-amber-700 font-semibold" };
    return { status: "Good", statusClasses: "border-emerald-200 bg-emerald-50 text-emerald-700", textClass: "text-emerald-700 font-medium" };
}

// --- Component Detail Dialog ---
function ComponentDetailDialog({
    comp,
    open,
    onClose,
    onUpdate,
    role,
}: {
    comp: ComponentItem | null;
    open: boolean;
    onClose: () => void;
    onUpdate: (sku: string, warehouse: string | undefined, newStock: number, imageUrl?: string, newName?: string, minStock?: number, newTag?: string) => void;
    role: string;
}) {
    const [inputValue, setInputValue] = useState<string>("");
    const [nameValue, setNameValue] = useState<string>("");
    const [minStockValue, setMinStockValue] = useState<string>("");
    const [tagValue, setTagValue] = useState<string>("Local");
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    // User: withdrawal request quantity
    const [reqQty, setReqQty] = useState<string>("1");
    const [submitted, setSubmitted] = useState(false);

    const [prevComp, setPrevComp] = useState<ComponentItem | null>(null);
    const [prevOpen, setPrevOpen] = useState<boolean>(false);

    if (comp !== prevComp || open !== prevOpen) {
        setPrevComp(comp);
        setPrevOpen(open);
        if (comp && open) {
            setInputValue(comp.stock.toString());
            setNameValue(comp.name);
            setMinStockValue((comp.min_stock ?? 0).toString());
            setTagValue(comp.tag || "Local");
            setImageUrl(comp.image);
            setReqQty("1");
            setSubmitted(false);
        }
    }

    const currentQty = parseInt(inputValue, 10);
    const safeQty = isNaN(currentQty) ? 0 : Math.max(0, currentQty);

    function handleIncrement() { 
        const next = safeQty + 1;
        console.log(`[DEBUG] Increment: ${safeQty} -> ${next}`);
        setInputValue(next.toString()); 
    }
    function handleDecrement() { 
        const next = Math.max(0, safeQty - 1);
        console.log(`[DEBUG] Decrement: ${safeQty} -> ${next}`);
        setInputValue(next.toString()); 
    }
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (/^\d*$/.test(e.target.value)) setInputValue(e.target.value);
    }

    function handleSave() {
        if (!comp) return;
        const safeMin = parseInt(minStockValue, 10);
        const finalMin = isNaN(safeMin) ? (comp.min_stock || 0) : safeMin;
        
        console.log(`[DEBUG] Saving: Stock=${safeQty}, Min=${finalMin}, Tag=${tagValue} for SKU: ${comp.sku}`);
        onUpdate(comp.sku, comp.warehouse, safeQty, imageUrl, nameValue, finalMin, tagValue);
        onClose();
    }

    async function handleSendRequest() {
        if (!comp) return;
        const qty = parseInt(reqQty, 10);
        if (isNaN(qty) || qty <= 0) return;
        const result = await addRequest({ type: "component", itemSku: comp.sku, itemName: comp.name, requestedQty: qty });
        if (result) setSubmitted(true);
    }

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) setImageUrl(URL.createObjectURL(file));
    }

    function handleOpenChange(o: boolean) {
        if (!o) { setInputValue(""); setNameValue(""); onClose(); }
    }

    if (!comp) return null;
    const { status, statusClasses } = getStatusInfo(safeQty, comp.min_stock || 0);

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
                            <img src={imageUrl} alt={comp.name} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-neutral-400">
                                <Package className="h-14 w-14 opacity-80" strokeWidth={1.5} />
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
                                        className="w-full bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-violet-500 focus:outline-none transition-colors py-0.5 truncate"
                                        placeholder="Component Name"
                                    />
                                ) : (
                                    comp.name
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/60">{comp.sku}</span>
                            <Badge variant="secondary" className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 border-violet-100/50">
                                {comp.category}
                            </Badge>
                            {role === "admin" ? (
                                <select 
                                    value={tagValue}
                                    onChange={(e) => setTagValue(e.target.value)}
                                    className="text-[11px] px-2 py-0.5 rounded border border-neutral-200 bg-white text-neutral-700 shadow-sm focus:outline-none focus:border-violet-500 hover:border-neutral-300 transition-colors cursor-pointer appearance-none pr-6 relative"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                                >
                                    <option value="Local">Local</option>
                                    <option value="Import">Import</option>
                                </select>
                            ) : (
                                <Badge variant="secondary" className={`text-[11px] px-2 py-0.5 ${comp.tag === 'Import' ? 'bg-purple-50 text-purple-700 border-purple-100/50' : 'bg-blue-50 text-blue-700 border-blue-100/50'}`}>
                                    {comp.tag || "Local"}
                                </Badge>
                            )}
                            <Badge variant="secondary" className={`text-[11px] px-2 py-0.5 ${statusClasses}`}>
                                {status}
                            </Badge>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Critical Stock</span>
                            <span className="font-semibold text-neutral-900 text-base">
                                {role === "admin" ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={minStockValue}
                                            onChange={(e) => { if (/^\d*$/.test(e.target.value)) setMinStockValue(e.target.value); }}
                                            className="w-12 bg-transparent border-b border-neutral-300 focus:border-violet-500 focus:outline-none text-center"
                                        />
                                        <span className="text-xs text-neutral-400 font-normal">pcs</span>
                                    </div>
                                ) : (
                                    <>{comp.min_stock} <span className="text-xs text-neutral-400 font-normal">pcs</span></>
                                )}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Current Qty</span>
                            <span className="font-semibold text-neutral-900 text-base">{comp.stock} <span className="text-xs text-neutral-400 font-normal">pcs</span></span>
                        </div>
                    </div>

                    {/* ── ADMIN / CO-ADMIN: full qty editor ── */}
                    {(role === "admin" || role === "co-admin") && (
                        <>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-neutral-900">Adjust Stock</span>
                                    {inputValue === "" && (
                                        <span className="text-[10px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Invalid</span>
                                    )}
                                </div>
                                <div className="flex items-center p-1 rounded-xl border border-neutral-200 bg-white shadow-sm transition-all focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10">
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
                                <Button variant="ghost" className="flex-1 h-10 rounded-lg text-neutral-600 hover:bg-neutral-100 text-sm font-medium" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button className="flex-[1.5] h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-md" onClick={handleSave} disabled={inputValue === ""}>
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
                                        <span className="text-xs text-neutral-400">Available: {comp.stock} pcs</span>
                                    </div>
                                    <div className="flex items-center p-1 rounded-xl border border-neutral-200 bg-white shadow-sm focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10">
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
                                            disabled={parseInt(reqQty || "0") >= comp.stock}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 text-center">Your request will be sent to the admin for approval.</p>
                                </div>
                                <div className="flex gap-2.5 pt-1">
                                    <Button variant="ghost" className="flex-1 h-10 rounded-lg text-neutral-600 hover:bg-neutral-100 text-sm font-medium" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-[1.5] h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-md"
                                        onClick={handleSendRequest}
                                        disabled={!reqQty || parseInt(reqQty) <= 0 || parseInt(reqQty) > comp.stock}
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


// --- Main Page ---
export default function ComponentsPage() {
    const { role } = useClientRole();
    const [components, setComponents] = useState<ComponentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComp, setSelectedComp] = useState<ComponentItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");
    const [tagFilter, setTagFilter] = useState("All Types");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState<{sku: string, warehouse: string | undefined, name: string} | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchComponents = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/inventory/components");
            if (res.ok) {
                const data = await res.json();
                setComponents(data);
            }
        } catch (error) {
            console.error("Failed to fetch components:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComponents();
        
        // Real-time Sync: Polling every 10 seconds
        const interval = setInterval(() => {
            fetchComponents();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleAddComponent = async (newComp: ComponentItem) => {
        try {
            const res = await fetch("/api/inventory/components", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newComp),
            });
            if (res.ok) fetchComponents();
        } catch (error) {
            console.error("Failed to add component:", error);
        }
    };

    const handleRowClick = (comp: ComponentItem) => {
        setSelectedComp(comp);
        setDialogOpen(true);
    };

    const handleUpdate = async (sku: string, warehouse: string | undefined, newStock: number, imageUrl?: string, newName?: string, minStock?: number, newTag?: string) => {
        try {
            console.log(`[API_PATCH] Updating ${sku} - New Stock: ${newStock}, New Min: ${minStock}, Tag: ${newTag}`);
            const res = await fetch("/api/inventory/components", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sku, warehouse, stock: newStock, image: imageUrl, name: newName, min_stock: minStock, tag: newTag }),
            });
            const updated = await res.json();
            console.log(`[API_PATCH_RESPONSE] Status: ${res.status}`, updated);
            
            if (res.ok) {
                // Synchronize the selected component state so the modal keeps the correct value
                if (selectedComp && selectedComp.sku === sku && selectedComp.warehouse === warehouse) {
                    setSelectedComp(updated);
                }
                fetchComponents();
            }
        } catch (error) {
            console.error("Failed to update component UI:", error);
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedComp(null);
    };

    const handleDelete = (e: React.MouseEvent, sku: string, warehouse: string | undefined, name: string) => {
        e.stopPropagation();
        setComponentToDelete({ sku, warehouse, name });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!componentToDelete) return;
        
        setIsDeleting(true);
        try {
            const { sku, warehouse } = componentToDelete;
            const res = await fetch(`/api/inventory/components?sku=${sku}&warehouse=${warehouse}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Component deleted successfully", {
                    description: `${componentToDelete.name} has been removed.`
                });
                fetchComponents();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete component");
            }
        } catch (error) {
            console.error("Failed to delete component:", error);
            toast.error("An error occurred while deleting");
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = components.reduce((acc, c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                              c.sku.toLowerCase().includes(search.toLowerCase());
        
        let normalizedWarehouse = c.warehouse;
        // Normalize any old data that might still have the Main/Secondary prefixes
        if (c.warehouse === "PWX IoT Hub" || c.warehouse === "Main Warehouse" || c.warehouse === "Main Warehouse - PWX IoT Hub") {
            normalizedWarehouse = "PWX IoT Hub";
        } else if (c.warehouse === "Jenny's" || c.warehouse === "Secondary Warehouse" || c.warehouse === "Jenny's Warehouse" || c.warehouse === "Secondary Warehouse - Jenny's Warehouse") {
            normalizedWarehouse = "Jenny's";
        }

        const matchesWarehouse = warehouseFilter === "all" || warehouseFilter === "All Warehouses" || normalizedWarehouse === warehouseFilter;
        
        const matchesTag = tagFilter === "All Types" || (c.tag || "Local") === tagFilter;
        
        if (matchesSearch && matchesWarehouse && matchesTag) {
            acc.push({ ...c, warehouse: normalizedWarehouse });
        }
        return acc;
    }, [] as ComponentItem[]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Components
                    </h1>
                    <p className="mt-1 text-neutral-500">
                        Track and manage electronic components inventory
                    </p>
                </div>
                {(role === "admin" || role === "co-admin") && (
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline"
                            onClick={() => exportComponentsToExcel(filtered)}
                            className="bg-white text-neutral-700 hover:bg-neutral-50 h-10 border-neutral-200 shadow-sm transition-colors"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                        <AddComponentsDialog
                            onAdd={handleAddComponent}
                            existingSkus={components.map(c => c.sku)}
                        />
                    </div>
                )}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search components by name or SKU..."
                        className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500 w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] border-neutral-200 bg-white text-neutral-900">
                        <SelectValue placeholder="All Warehouses" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="bg-white border-neutral-200 text-neutral-900 z-50">
                        <SelectItem value="All Warehouses" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">All Warehouses</SelectItem>
                        <SelectItem value="PWX IoT Hub" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">PWX IoT Hub</SelectItem>
                        <SelectItem value="Jenny's" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">Jenny&apos;s</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-full sm:w-[150px] border-neutral-200 bg-white text-neutral-900">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="bg-white border-neutral-200 text-neutral-900 z-50">
                        <SelectItem value="All Types" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">All Types</SelectItem>
                        <SelectItem value="Local" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">Local</SelectItem>
                        <SelectItem value="Import" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">Import</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Component List */}
            <Card className="border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900">All Components</CardTitle>
                    <CardDescription className="text-neutral-500">
                        {filtered.length} component{filtered.length !== 1 ? "s" : ""} tracked — click a row to view details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filtered.map((comp) => {
                            const { status, statusClasses, textClass } = getStatusInfo(comp.stock, comp.min_stock || 0);

                            return (
                                <div
                                    key={`${comp.sku}-${comp.warehouse}`}
                                    className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 transition-all hover:bg-violet-50/40 hover:border-violet-200 hover:shadow-sm cursor-pointer select-none"
                                    onClick={() => handleRowClick(comp)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") handleRowClick(comp);
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 overflow-hidden border border-violet-100/50">
                                            {comp.image ? (
                                                <img src={comp.image} alt={comp.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Cpu className="h-5 w-5 text-violet-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">{comp.name}</p>
                                            <p className="text-xs text-neutral-500">{comp.sku}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden text-right sm:block">
                                            <p className="text-xs text-neutral-500">
                                                Qty:{" "}
                                                <span className={textClass}>{comp.stock} pcs</span>
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs border ${comp.tag === 'Import' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}
                                        >
                                            {comp.tag || "Local"}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs border-neutral-200 bg-neutral-100 text-neutral-600"
                                        >
                                            {comp.category}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs border-neutral-200 bg-neutral-100 text-neutral-600"
                                        >
                                            {comp.warehouse}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className={statusClasses}
                                        >
                                            {status}
                                        </Badge>
                                        {role === "admin" && (
                                            <button
                                                onClick={(e) => handleDelete(e, comp.sku, comp.warehouse, comp.name)}
                                                className="ml-1 p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                title="Delete component"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {filtered.length === 0 && (
                            <p className="text-center text-sm text-neutral-400 py-8">No components match your search.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Component Detail Dialog */}
            <ComponentDetailDialog
                comp={selectedComp}
                open={dialogOpen}
                onClose={handleCloseDialog}
                onUpdate={handleUpdate}
                role={role}
            />

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="sm:max-w-[420px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Component</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-neutral-900">{componentToDelete?.name}</span>? 
                            This action cannot be undone and will permanently remove the item from this warehouse.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
