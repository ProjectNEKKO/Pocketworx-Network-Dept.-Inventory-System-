"use client";

import {
    useState,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { findBomById, type StoredComponentRow } from "../bom-storage";
import type { ComponentItem } from "@/app/(protected)/components/add_components";
import { COMPONENT_CATALOG_SEED } from "@/data/components-seed";
import { loadComponentCatalog } from "@/lib/inventory-catalog";
import { formatCurrency } from "@/lib/format-currency";
import { CatalogPickerDialog } from "../catalog-picker-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    FileStack,
    PackagePlus,
    PackageSearch,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface ComponentRow {
    id: string;
    lineNumber: number;
    level: number;
    partNumber: string;
    description: string;
    qpa: number | "";
    uom: string;
    unitCost: number | "";
    manufacturer: string;
    mpn: string;
    refDesignator: string;
    catalogSku?: string;
}

// Helper to generate a unique ID (client-safe for first render if needed)
const generateId = () => (typeof window !== "undefined" ? crypto.randomUUID() : "TEMP-ID");

const emptyComponent = (lineNumber: number): ComponentRow => ({
    id: generateId(),
    lineNumber,
    level: 1,
    partNumber: "",
    description: "",
    qpa: 1,
    uom: "Each",
    unitCost: 0,
    manufacturer: "",
    mpn: "",
    refDesignator: "",
    catalogSku: undefined,
});

function normalizeLoadedRow(r: StoredComponentRow, index: number): ComponentRow {
    return {
        id: r.id || generateId(),
        lineNumber: r.lineNumber || index + 1,
        level: r.level ?? 1,
        partNumber: r.partNumber ?? "",
        description: r.description ?? "",
        qpa: typeof r.qpa === "number" ? r.qpa : 1,
        uom: r.uom ?? "Each",
        unitCost: typeof r.unitCost === "number" ? r.unitCost : 0,
        manufacturer: r.manufacturer ?? "",
        mpn: r.mpn ?? "",
        refDesignator: r.refDesignator ?? "",
        catalogSku:
            typeof r.catalogSku === "string" && r.catalogSku.trim() !== ""
                ? r.catalogSku
                : undefined,
    };
}

const UOM_OPTIONS = ["Piece", "Set", "Meter", "Centimeter", "Millimeter", "Kilogram", "Gram", "Liter", "Milliliter", "Roll", "Box", "Panel"];
const PHASE_OPTIONS = ["Prototype", "Pre-Production", "Production", "End of Life"];

// ─── Main Page ───────────────────────────────────────────────────────
function CreateBOMPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editParam = searchParams.get("edit");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 state — Assembly Metadata
    const [bomName, setBomName] = useState("");
    const [cpn, setCpn] = useState("");
    const [revision, setRevision] = useState("Rev A");
    const [phase, setPhase] = useState("Prototype");
    // Removed Assembly UOM
    const [targetQty, setTargetQty] = useState<number | "">(1);
    const [description, setDescription] = useState("");

    // Step 2 state — Component Rows
    const [components, setComponents] = useState<ComponentRow[]>([]);

    useEffect(() => {
        // Hydrate initial component on client-only mount to avoid SSR mismatches
        if (components.length === 0) {
            setComponents([emptyComponent(1)]);
        }
    }, [components]);

    const [catalog, setCatalog] =
        useState<ComponentItem[]>(COMPONENT_CATALOG_SEED);
    const [catalogPickerOpen, setCatalogPickerOpen] = useState(false);
    const catalogPickerRowRef = useRef<string | null>(null);

    const refreshCatalog = useCallback(() => {
        setCatalog(loadComponentCatalog(COMPONENT_CATALOG_SEED));
    }, []);

    /* eslint-disable react-hooks/set-state-in-effect -- client-only edit form hydration */
    // Load BOM from session or localStorage when opening /bom/create?edit=<id>
    useEffect(() => {
        if (!editParam) return;

        let loadedFromSession = false;
        try {
            const raw = sessionStorage.getItem("pocketworx_edit_bom");
            if (raw) {
                const bom = JSON.parse(raw) as Record<string, unknown>;
                if (String(bom.id ?? "") === editParam) {
                    setBomName(String(bom.name ?? ""));
                    setCpn(String(bom.cpn ?? ""));
                    setRevision(String(bom.revision ?? "Rev A"));
                    setPhase(String(bom.phase ?? "Prototype"));
                    // Removed Assembly UOM Hydration
                    if (typeof bom.targetQty === "number") {
                        setTargetQty(bom.targetQty);
                    } else {
                        setTargetQty(1);
                    }
                    setDescription(String(bom.description ?? ""));
                    const rows = Array.isArray(bom.componentRows)
                        ? (bom.componentRows as StoredComponentRow[])
                        : Array.isArray(bom.components)
                          ? (bom.components as StoredComponentRow[])
                          : [];
                    if (rows.length > 0) {
                        setComponents(rows.map((r, i) => normalizeLoadedRow(r, i)));
                    } else {
                        setComponents([emptyComponent(1)]);
                    }
                    setEditingId(String(bom.id));
                    sessionStorage.removeItem("pocketworx_edit_bom");
                    loadedFromSession = true;
                }
            }
        } catch {
            // ignore invalid session payload
        }

        if (loadedFromSession) return;

        const entry = findBomById(editParam);
        if (!entry) return;

        setBomName(entry.name);
        setCpn(entry.cpn ?? "");
        setRevision(entry.revision);
        setPhase(entry.phase ?? "Prototype");
        // Removed Assembly UOM Hydration
        setTargetQty(entry.targetQty ?? 1);
        setDescription(entry.description ?? "");
        const rows = entry.componentRows ?? [];
        if (rows.length > 0) {
            setComponents(rows.map((r, i) => normalizeLoadedRow(r, i)));
        } else {
            setComponents([emptyComponent(1)]);
        }
        setEditingId(entry.id);
    }, [editParam]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const validComponents = useMemo(
        () => components.filter((c) => c.partNumber.trim() !== ""),
        [components]
    );

    const totalBomCost = useMemo(
        () =>
            validComponents.reduce((sum, c) => {
                const q = typeof c.qpa === "number" ? c.qpa : 0;
                const cost = typeof c.unitCost === "number" ? c.unitCost : 0;
                return sum + q * cost;
            }, 0),
        [validComponents]
    );

    const canProceedStep1 = bomName.trim().length > 0 && cpn.trim().length > 0;

    // ─── Component Table Helpers ─────────────────────────────────────
    const addRow = useCallback(() => {
        setComponents((prev) => [
            ...prev,
            emptyComponent(prev.length + 1),
        ]);
    }, []);

    const removeRow = useCallback((id: string) => {
        setComponents((prev) => {
            const next = prev.filter((c) => c.id !== id);
            return next.map((c, i) => ({ ...c, lineNumber: i + 1 }));
        });
    }, []);

    const updateRow = useCallback(
        (id: string, field: keyof ComponentRow, value: string | number) => {
            setComponents((prev) =>
                prev.map((c) => {
                    if (c.id !== id) return c;
                    const next: ComponentRow = { ...c, [field]: value };
                    if (field === "partNumber" && typeof value === "string") {
                        const t = value.trim();
                        next.catalogSku =
                            c.catalogSku && t === c.catalogSku
                                ? c.catalogSku
                                : undefined;
                    }
                    return next;
                })
            );
        },
        []
    );

    // ─── Save Logic ──────────────────────────────────────────────────
    const handleSave = useCallback(
        (status: "Draft" | "Active") => {
            const filteredComponents = components.filter(
                (c) => c.partNumber.trim() !== ""
            );
            if (filteredComponents.length === 0) {
                const ok = window.confirm(
                    "This BOM has no lines with a part number. Save anyway?"
                );
                if (!ok) return;
            }
            const rolledUpCost = filteredComponents.reduce(
                (sum, c) => {
                    const q = typeof c.qpa === "number" ? c.qpa : 0;
                    const cost = typeof c.unitCost === "number" ? c.unitCost : 0;
                    return sum + q * cost;
                },
                0
            );
            const id =
                editingId ?? `BOM-${Date.now().toString().slice(-4)}`;
            const newBom = {
                id,
                name: bomName,
                cpn,
                revision,
                phase,
                // Removed assemblyUom from save payload
                targetQty: targetQty === "" ? 1 : targetQty,
                description,
                components: filteredComponents.map(c => ({
                    ...c,
                    qpa: typeof c.qpa === "number" ? c.qpa : 0,
                    unitCost: typeof c.unitCost === "number" ? c.unitCost : 0,
                })),
                totalCost: rolledUpCost,
                status,
                author: "Current User",
                lastModified: "Just now",
            };

            const existing = JSON.parse(
                localStorage.getItem("pocketworx_boms") || "[]"
            ) as Record<string, unknown>[];

            if (editingId) {
                const idx = existing.findIndex((x) => x.id === editingId);
                if (idx >= 0) {
                    existing[idx] = newBom;
                } else {
                    existing.unshift(newBom);
                }
            } else {
                existing.unshift(newBom);
            }
            localStorage.setItem("pocketworx_boms", JSON.stringify(existing));

            setEditingId(null);
            router.push("/bom");
        },
        [
            editingId,
            bomName,
            cpn,
            revision,
            phase,
            // Removed assemblyUom from dependencies
            targetQty,
            description,
            components,
            router,
        ]
    );

    const openCatalogPickerForRow = useCallback(
        (rowId: string) => {
            refreshCatalog();
            catalogPickerRowRef.current = rowId;
            setCatalogPickerOpen(true);
        },
        [refreshCatalog]
    );

    const handleCatalogPick = useCallback((item: ComponentItem) => {
        const rowId = catalogPickerRowRef.current;
        if (!rowId) return;
        setComponents((prev) =>
            prev.map((c) =>
                c.id === rowId
                    ? {
                          ...c,
                          catalogSku: item.sku,
                          partNumber: item.sku,
                          description: item.name,
                          unitCost:
                              typeof (item as any).unitCost === "number"
                                  ? (item as any).unitCost
                                  : 0,
                      }
                    : c
            )
        );
        catalogPickerRowRef.current = null;
    }, []);

    // ─── UI ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen">
            {/* Top bar */}
            <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/bom")}
                            className="text-neutral-500 hover:text-neutral-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to BOMs
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                                <PackagePlus className="h-4 w-4 text-amber-600" />
                            </div>
                            <h1 className="text-lg font-semibold text-neutral-900">
                                {editingId ? "Edit BOM" : "Create New BOM"}
                            </h1>
                        </div>
                    </div>

                    {/* Step indicator */}
                    <div className="hidden sm:flex items-center gap-6">
                        {/* Step 1 */}
                        <div className="flex items-center gap-2">
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                                    currentStep === 1
                                        ? "bg-amber-500 text-white shadow-sm shadow-amber-500/40"
                                        : currentStep > 1
                                        ? "bg-emerald-500 text-white"
                                        : "bg-neutral-200 text-neutral-500"
                                }`}
                            >
                                {currentStep > 1 ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    "1"
                                )}
                            </div>
                            <span
                                className={`text-sm font-medium ${
                                    currentStep === 1
                                        ? "text-neutral-900"
                                        : "text-neutral-500"
                                }`}
                            >
                                Assembly Info
                            </span>
                        </div>

                        <div className="h-px w-10 bg-neutral-300" />

                        {/* Step 2 */}
                        <div className="flex items-center gap-2">
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                                    currentStep === 2
                                        ? "bg-amber-500 text-white shadow-sm shadow-amber-500/40"
                                        : "bg-neutral-200 text-neutral-500"
                                }`}
                            >
                                2
                            </div>
                            <span
                                className={`text-sm font-medium ${
                                    currentStep === 2
                                        ? "text-neutral-900"
                                        : "text-neutral-500"
                                }`}
                            >
                                Components
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                {currentStep === 1 && (
                    /* ──────────────── STEP 1: Assembly Metadata ──────────────── */
                    <div className="mx-auto max-w-2xl space-y-8">
                        <Card className="border-neutral-200 bg-white shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                                        <FileStack className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-neutral-900">
                                            Assembly Information
                                        </CardTitle>
                                        <CardDescription className="text-neutral-500">
                                            Define the master assembly metadata
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Row: BOM Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="bom-name" className="text-sm font-medium text-neutral-700">
                                        BOM Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="bom-name"
                                        placeholder="e.g. NextGen Sensor Node Baseboard"
                                        value={bomName}
                                        onChange={(e) => setBomName(e.target.value)}
                                        className="border-neutral-200 focus:border-amber-400 focus:ring-amber-400/30"
                                        autoFocus
                                    />
                                </div>

                                {/* Row: CPN + Revision */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="cpn" className="text-sm font-medium text-neutral-700">
                                            Internal Part Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="cpn"
                                            placeholder="e.g. ASSY-992-1A"
                                            value={cpn}
                                            onChange={(e) => setCpn(e.target.value)}
                                            className="border-neutral-200 focus:border-amber-400 focus:ring-amber-400/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="revision" className="text-sm font-medium text-neutral-700">
                                            Revision
                                        </Label>
                                        <Input
                                            id="revision"
                                            placeholder="Rev A"
                                            value={revision}
                                            onChange={(e) => setRevision(e.target.value)}
                                            className="border-neutral-200 focus:border-amber-400 focus:ring-amber-400/30"
                                        />
                                    </div>
                                </div>

                                {/* Row: Phase + Target Qty */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-neutral-700">
                                            Phase / Lifecycle
                                        </Label>
                                        <Select value={phase} onValueChange={setPhase}>
                                            <SelectTrigger className="w-full border-neutral-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PHASE_OPTIONS.map((p) => (
                                                    <SelectItem key={p} value={p}>
                                                        {p}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="target-qty" className="text-sm font-medium text-neutral-700">
                                            Target Build Quantity
                                        </Label>
                                        <Input
                                            id="target-qty"
                                            type="number"
                                            min={1}
                                            placeholder="1"
                                            value={targetQty}
                                            onChange={(e) =>
                                                setTargetQty(
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                                )
                                            }
                                            className="border-neutral-200 focus:border-amber-400 focus:ring-amber-400/30 w-full"
                                        />
                                    </div>
                                </div>

                                {/* Row: Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
                                        Description / Notes
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="e.g. Prototype build for Q3 field testing..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="min-h-[100px] border-neutral-200 focus:border-amber-400 focus:ring-amber-400/30"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/bom")}
                                className="border-neutral-200 text-neutral-600"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                disabled={!canProceedStep1}
                                onClick={() => setCurrentStep(2)}
                                className="bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-orange-400 disabled:opacity-50"
                            >
                                Continue to Components
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    /* ──────────────── STEP 2: Component Table ──────────────── */
                    <div className="space-y-6">
                        {/* Summary bar */}
                        <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                                    <FileStack className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-neutral-900">
                                        {bomName}
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                        {cpn} · {revision} · {phase}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-center">
                                    <p className="text-xs text-neutral-500">
                                        Components
                                    </p>
                                    <p className="text-lg font-bold text-neutral-900">
                                        {validComponents.length}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-center min-w-[120px]">
                                    <p className="text-xs text-emerald-600">
                                        Total BOM Cost
                                    </p>
                                    <p className="text-lg font-bold text-emerald-700">
                                        {formatCurrency(totalBomCost)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Component Data Grid */}
                        <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div>
                                    <CardTitle className="text-base text-neutral-900">
                                        Component Line Items
                                    </CardTitle>
                                    <CardDescription className="text-neutral-500">
                                        Add parts manually or use the catalog
                                        button to pull from the Components
                                        inventory.
                                    </CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={addRow}
                                    className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                >
                                    <Plus className="mr-2 h-3.5 w-3.5" />
                                    Add Row
                                </Button>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-neutral-50/80">
                                        <TableRow className="hover:bg-transparent text-xs">
                                            <TableHead className="w-[60px] text-center">
                                                #
                                            </TableHead>
                                            <TableHead className="w-[50px]">
                                                Lvl
                                            </TableHead>
                                            <TableHead className="min-w-[140px]">
                                                SKU
                                            </TableHead>
                                            <TableHead className="min-w-[180px]">
                                                Description
                                            </TableHead>
                                            <TableHead className="w-[80px]">
                                                QPA
                                            </TableHead>
                                            <TableHead className="w-[110px]">
                                                UOM
                                            </TableHead>
                                            <TableHead className="w-[110px]">
                                                Unit Cost
                                            </TableHead>
                                            <TableHead className="w-[110px]">
                                                Total Cost
                                            </TableHead>
                                            <TableHead className="min-w-[130px]">
                                                Manufacturer
                                            </TableHead>
                                            <TableHead className="min-w-[130px]">
                                                MPN
                                            </TableHead>
                                            <TableHead className="min-w-[100px]">
                                                Ref Des
                                            </TableHead>
                                            <TableHead className="w-[50px]" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {components.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className="hover:bg-amber-50/30 transition-colors"
                                            >
                                                {/* Line # */}
                                                <TableCell className="text-center text-xs font-medium text-neutral-400">
                                                    {row.lineNumber}
                                                </TableCell>
                                                {/* Level */}
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={row.level}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                row.id,
                                                                "level",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        className="h-8 w-14 text-xs border-neutral-200 text-center"
                                                    />
                                                </TableCell>
                                                {/* Part Number */}
                                                <TableCell>
                                                    <div className="flex min-w-[140px] items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 shrink-0 border-amber-200 text-amber-800 hover:bg-amber-50"
                                                            title="Pick from Components catalog"
                                                            onClick={() =>
                                                                openCatalogPickerForRow(
                                                                    row.id
                                                                )
                                                            }
                                                        >
                                                            <PackageSearch className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Input
                                                            value={
                                                                row.partNumber
                                                            }
                                                            onChange={(e) =>
                                                                updateRow(
                                                                    row.id,
                                                                    "partNumber",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="SKU"
                                                            className="h-8 min-w-0 flex-1 border-neutral-200 text-xs"
                                                        />
                                                    </div>
                                                </TableCell>
                                                {/* Description */}
                                                <TableCell>
                                                    <Input
                                                        value={row.description}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                row.id,
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Resistor 10k 0402"
                                                        className="h-8 text-xs border-neutral-200"
                                                    />
                                                </TableCell>
                                                {/* QPA */}
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={row.qpa}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                row.id,
                                                                "qpa",
                                                                e.target.value === "" ? "" : Number(e.target.value)
                                                            )
                                                        }
                                                        className="h-8 w-20 text-xs border-neutral-200 text-right"
                                                    />
                                                </TableCell>
                                                {/* UOM */}
                                                <TableCell>
                                                    <Select
                                                        value={row.uom}
                                                        onValueChange={(v) =>
                                                            updateRow(
                                                                row.id,
                                                                "uom",
                                                                v
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-full text-xs border-neutral-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {UOM_OPTIONS.map(
                                                                (u) => (
                                                                    <SelectItem
                                                                        key={u}
                                                                        value={u}
                                                                    >
                                                                        {u}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                {/* Unit Cost */}
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={row.unitCost}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                row.id,
                                                                "unitCost",
                                                                e.target.value === "" ? "" : Number(e.target.value)
                                                            )
                                                        }
                                                        className="h-8 w-24 text-xs border-neutral-200 text-right"
                                                    />
                                                </TableCell>
                                                {/* Total Cost (read-only) */}
                                                <TableCell className="text-right text-xs font-medium text-neutral-700 tabular-nums">
                                                    {formatCurrency(
                                                        (typeof row.qpa === "number" ? row.qpa : 0) * 
                                                        (typeof row.unitCost === "number" ? row.unitCost : 0)
                                                    )}
                                                </TableCell>
                                                {/* Manufacturer */}
                                                <TableCell>
                                                    <Input
                                                        value={
                                                            row.manufacturer
                                                        }
                                                        onChange={(e) =>
                                                            updateRow(
                                                                row.id,
                                                                "manufacturer",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Yageo"
                                                        className="h-8 text-xs border-neutral-200"
                                                    />
                                                </TableCell>
                                                {/* MPN */}
                                                <TableCell>
                                                    <Input
                                                        value={row.mpn}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                row.id,
                                                                "mpn",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="RC0402FR"
                                                        className="h-8 text-xs border-neutral-200"
                                                    />
                                                </TableCell>
                                                {/* Ref Designator */}
                                                <TableCell>
                                                    <Input
                                                        value={
                                                            row.refDesignator
                                                        }
                                                        onChange={(e) =>
                                                            updateRow(
                                                                row.id,
                                                                "refDesignator",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="R1, R2"
                                                        className="h-8 text-xs border-neutral-200"
                                                    />
                                                </TableCell>
                                                {/* Delete */}
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeRow(row.id)
                                                        }
                                                        className="h-7 w-7 p-0 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Add row footer */}
                            <div className="border-t border-neutral-100 p-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={addRow}
                                    className="text-xs text-neutral-500 hover:text-amber-700"
                                >
                                    <Plus className="mr-1.5 h-3 w-3" />
                                    Add another component
                                </Button>
                            </div>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                                className="border-neutral-200 text-neutral-600"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Assembly Info
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleSave("Draft")}
                                    className="border-neutral-200 text-neutral-600"
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    onClick={() => handleSave("Active")}
                                    className="bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-orange-400"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save &amp; Publish Revision
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CatalogPickerDialog
                open={catalogPickerOpen}
                onOpenChange={(open) => {
                    setCatalogPickerOpen(open);
                    if (!open) catalogPickerRowRef.current = null;
                }}
                catalog={catalog}
                onPick={handleCatalogPick}
            />
        </div>
    );
}

export default function CreateBOMPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-white text-neutral-500">
                    Loading…
                </div>
            }
        >
            <CreateBOMPageInner />
        </Suspense>
    );
}
