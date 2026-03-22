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
import { Cpu, Search, Plus, Minus, Package, Upload, Trash2 } from "lucide-react";
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
import { getRole } from "@/lib/auth";
import { AddComponentsDialog, ComponentItem } from "./add_components";

const initialComponents: ComponentItem[] = [
    { name: "10ft RSC Pipe 1.5inch", sku: "PIPE-RSC-10FT-15", stock: 50, min: 100, category: "Hardware" },
    { name: "2-Pin Male Plug", sku: "ELEC-2PIN-M", stock: 200, min: 100, category: "Accessories" },
    { name: "2 hole C Clamp 1-1/2' RGD", sku: "HW-CCLAMP-15", stock: 30, min: 100, category: "Accessories" },
    { name: "32cm SMA", sku: "CBL-SMA-32", stock: 50, min: 100, category: "Cable" },
    { name: "32cm SMA Male to Female", sku: "CBL-SMA-MF-32", stock: 30, min: 100, category: "Cable" },
    { name: "915Mhz Lora Antenna 3.8dBi", sku: "ANT-LORA-915-3.8", stock: 50, min: 100, category: "RF" },
    { name: "915Mhz Lora Antenna 3dBi", sku: "ANT-LORA-915", stock: 50, min: 100, category: "RF" },
    { name: "AC Outlet", sku: "ELEC-AC-OUTLET", stock: 50, min: 100, category: "Electrical" },
    { name: "ADA Fruit for GSM Antenna", sku: "ADA-FRUIT-GSM", stock: 50, min: 100, category: "Enclosure" },
    { name: "ADA Fruit Weatherproof Enclosure", sku: "ADA-FRUIT", stock: 75, min: 100, category: "Connector" },
    { name: "Antenna Clamp", sku: "ANT-CLAMP", stock: 40, min: 100, category: "Hardware" },
    { name: "AWG Gauge #12 TTHN", sku: "WIRE-12", stock: 40, min: 100, category: "Accessories" },
    { name: "AWG Gauge #16 Duplex Flat Cord", sku: "WIRE-16-DUPLEX", stock: 50, min: 100, category: "Electrical" },
    { name: "CAT5e Cable", sku: "CBL-CAT5E", stock: 120, min: 200, category: "Networking" },
    { name: "Enclosure Dimension 168X149 mm", sku: "DIM-168-149", stock: 10, min: 50, category: "Enclosure" },
    { name: "Extension Bracket", sku: "BRKT-EXT", stock: 50, min: 100, category: "Hardware" },
    { name: "Gauge 12 AC Wire (Black)", sku: "WIRE-12-BLK", stock: 200, min: 200, category: "Accessories" },
    { name: "Gauge 12 AC Wire (Red)", sku: "WIRE-12-RED", stock: 200, min: 200, category: "Accessories" },
    { name: "Generic L- type Bracket", sku: "BRACKET-L", stock: 40, min: 100, category: "Accessories" },
    { name: "M3x20mm Self-Tapping Counter Sunk Head Black Screw", sku: "HW-M3X20-SCREW", stock: 50, min: 100, category: "Hardware" },
    { name: "M3x33mm Self-Tapping Counter Sunk Head Black Screw", sku: "HW-M3X33-SCREW", stock: 50, min: 100, category: "Hardware" },
    { name: "M5 Bolts and Nuts", sku: "HW-M5-BN", stock: 200, min: 300, category: "Hardware" },
    { name: "M5 Louver Vent with Nut", sku: "M5-VENT-NUT", stock: 90, min: 100, category: "Hardware" },
    { name: "M6 Bolts and Nuts", sku: "HW-M6-BN", stock: 180, min: 200, category: "Accessories" },
    { name: "M8 Tox and Screw", sku: "HW-M8-TOX", stock: 150, min: 300, category: "Hardware" },
    { name: "N Type Female Plug to SMA Plug Male 32cm", sku: "CBL-NF-SMAM-32", stock: 60, min: 100, category: "Cable" },
    { name: "NEMA R3 Enclosure", sku: "ENCL-NEMA-R3", stock: 50, min: 100, category: "Enclosure" },
    { name: "Outlet 4- Gang (For Extension)", sku: "ELEC-OUT-4G", stock: 25, min: 100, category: "Accessories" },
    { name: "Paddle Antenna", sku: "ANT-PADDLE", stock: 35, min: 100, category: "RF" },
    { name: "Padlock (Combination)", sku: "HW-PADLOCK-COMB", stock: 50, min: 100, category: "Hardware" },
    { name: "Panasonic Outlet (Receptacle)", sku: "ELEC-PAN-OUT", stock: 40, min: 100, category: "Accessories" },
    { name: "Plastic Molding (5/8'')", sku: "HW-MOLD-58", stock: 60, min: 100, category: "Accessories" },
    { name: "PoE Adaptor 24v ", sku: "POE-24V", stock: 40, min: 100, category: "Networking" },
    { name: "POE Splitter", sku: "NET-POE-SPLIT", stock: 50, min: 100, category: "Networking" },
    { name: "RG316 Bulk Head", sku: "RG316-BULK-HEAD", stock: 40, min: 100, category: "Cable" },
    { name: "RJ45 CAT6 Lan Cable (White)", sku: "CBL-CAT6-WHT", stock: 100, min: 200, category: "Networking" },
    { name: "RJ45 Connector Passthrough", sku: "RJ45-PASS-THROUGH", stock: 40, min: 100, category: "Networking" },
    { name: "Shieldcon LQT Galvanized Flexible Conduit (Soft) 1/2\"x50m Roll", sku: "HW-FLEX-COND-12", stock: 50, min: 100, category: "Hardware" },
    { name: "Tofu Heatsink (White)", sku: "HS-TOFU-WHT", stock: 25, min: 100, category: "Hardware" },
    { name: "U BOLTS 1 1/2 \"", sku: "HW-UBOLT-15", stock: 45, min: 100, category: "Accessories" },
].map((item, index) => ({
    ...item,
    warehouse: index % 2 === 0 ? "PWX IoT Hub" : "Genis"
}));

function getStatusInfo(stock: number, min: number) {
    const stockPercent = Math.round((stock / min) * 100);
    if (stockPercent >= 71) return { status: "Good", statusClasses: "border-emerald-200 bg-emerald-50 text-emerald-700", textClass: "text-emerald-700 font-medium" };
    if (stockPercent >= 31) return { status: "Fair", statusClasses: "border-blue-200 bg-blue-50 text-blue-700", textClass: "text-blue-700 font-medium" };
    if (stockPercent >= 11) return { status: "Low", statusClasses: "border-amber-200 bg-amber-50 text-amber-700", textClass: "text-amber-700 font-medium" };
    return { status: "Critical", statusClasses: "border-red-200 bg-red-50 text-red-700", textClass: "text-red-700 font-medium" };
}

// --- Component Detail Dialog ---
function ComponentDetailDialog({
    comp,
    open,
    onClose,
    onUpdate,
}: {
    comp: ComponentItem | null;
    open: boolean;
    onClose: () => void;
    onUpdate: (sku: string, newStock: number, imageUrl?: string) => void;
}) {
    const [inputValue, setInputValue] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const [prevComp, setPrevComp] = useState<ComponentItem | null>(null);
    const [prevOpen, setPrevOpen] = useState<boolean>(false);

    if (comp !== prevComp || open !== prevOpen) {
        setPrevComp(comp);
        setPrevOpen(open);
        if (comp && open) {
            setInputValue(comp.stock.toString());
            setImageUrl(comp.image);
        }
    }

    const currentQty = parseInt(inputValue, 10);
    const safeQty = isNaN(currentQty) ? 0 : Math.max(0, currentQty);

    function handleIncrement() {
        const next = safeQty + 1;
        setInputValue(next.toString());
    }

    function handleDecrement() {
        const next = Math.max(0, safeQty - 1);
        setInputValue(next.toString());
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        if (/^\d*$/.test(val)) setInputValue(val);
    }

    function handleSave() {
        if (!comp) return;
        onUpdate(comp.sku, safeQty, imageUrl);
        onClose();
    }

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        }
    }

    function handleOpenChange(o: boolean) {
        if (!o) {
            setInputValue("");
            onClose();
        }
    }

    if (!comp) return null;

    const { status, statusClasses } = getStatusInfo(safeQty, comp.min);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[400px] text-black p-0 overflow-hidden rounded-[20px] border border-neutral-200/60 shadow-xl bg-white mx-auto w-[90vw]">
                {/* Image area */}
                <div className="p-2.5 pb-0">
                    <div className="relative group flex h-48 w-full items-center justify-center rounded-[16px] bg-neutral-100/60 overflow-hidden border border-neutral-200/50">
                        {imageUrl ? (
                            <img src={imageUrl} alt={comp.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-neutral-400">
                                <Package className="h-14 w-14 opacity-80" strokeWidth={1.5} />
                            </div>
                        )}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white backdrop-blur-[2px]">
                            <Upload className="h-6 w-6 mb-1.5 drop-shadow-md" />
                            <span className="text-xs font-medium drop-shadow-md">Upload</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                {/* Detail body */}
                <div className="px-5 sm:px-6 py-5 space-y-5">
                    {/* Header Info */}
                    <div className="space-y-2.5">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-900 leading-tight tracking-tight text-left">
                                {comp.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/60">{comp.sku}</span>
                            <Badge variant="secondary" className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 border-violet-100/50 hover:bg-violet-100">
                                {comp.category}
                            </Badge>
                            <Badge variant="secondary" className={`text-[11px] px-2 py-0.5 ${statusClasses.replace('bg-', 'bg-opacity-10 text-')}`}>
                                {status}
                            </Badge>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Min Stock</span>
                            <span className="font-semibold text-neutral-900 text-base">{comp.min} <span className="text-xs text-neutral-400 font-normal">pcs</span></span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Status</span>
                            <span className="font-semibold text-neutral-900 text-base">{status}</span>
                        </div>
                    </div>

                    {/* Quantity adjuster */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-900">Stock Quantity</span>
                            {inputValue === "" && (
                                <span className="text-[10px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Invalid</span>
                            )}
                        </div>
                        <div className="flex items-center p-1 rounded-xl border border-neutral-200 bg-white shadow-sm transition-all focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
                                onClick={handleDecrement}
                                disabled={safeQty <= 0}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="flex-1 text-center text-lg font-bold border-0 focus-visible:ring-0 shadow-none px-2 h-9 bg-transparent"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
                                onClick={handleIncrement}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5 pt-1">
                        <Button
                            variant="ghost"
                            className="flex-1 h-10 rounded-lg text-neutral-600 hover:bg-neutral-100 text-sm font-medium"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[1.5] h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-md shadow-violet-600/20 transition-all hover:-translate-y-px"
                            onClick={handleSave}
                            disabled={inputValue === ""}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page ---
export default function ComponentsPage() {
    const [components, setComponents] = useState<ComponentItem[]>(initialComponents);
    const [selectedComp, setSelectedComp] = useState<ComponentItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");

    const handleAddComponent = (newComp: ComponentItem) => {
        setComponents([...components, newComp]);
    };

    const handleRowClick = (comp: ComponentItem) => {
        setSelectedComp(comp);
        setDialogOpen(true);
    };

    const handleUpdate = (sku: string, newStock: number, imageUrl?: string) => {
        setComponents(prev =>
            prev.map(c => c.sku === sku ? { ...c, stock: newStock, image: imageUrl !== undefined ? imageUrl : c.image } : c)
        );
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedComp(null);
    };

    const handleDelete = (e: React.MouseEvent, sku: string) => {
        e.stopPropagation();
        setComponents(prev => prev.filter(c => c.sku !== sku));
    };

    const filtered = components.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                              c.sku.toLowerCase().includes(search.toLowerCase());
        const matchesWarehouse = warehouseFilter === "all" || warehouseFilter === "All Warehouses" || c.warehouse === warehouseFilter;
        return matchesSearch && matchesWarehouse;
    });

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
                {getRole() === "admin" && (
                    <AddComponentsDialog
                        onAdd={handleAddComponent}
                        existingSkus={components.map(c => c.sku)}
                    />
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
                        <SelectItem value="Genis" className="text-neutral-900 cursor-pointer focus:bg-neutral-100">Genis</SelectItem>
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
                            const { status, statusClasses, textClass } = getStatusInfo(comp.stock, comp.min);

                            return (
                                <div
                                    key={comp.sku}
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
                                                Stock:{" "}
                                                <span className={textClass}>{comp.stock} pcs</span>
                                                <span className="text-neutral-400"> / {comp.min} min</span>
                                            </p>
                                        </div>
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
                                        {getRole() === "admin" && (
                                            <button
                                                onClick={(e) => handleDelete(e, comp.sku)}
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
            />
        </div>
    );
}
