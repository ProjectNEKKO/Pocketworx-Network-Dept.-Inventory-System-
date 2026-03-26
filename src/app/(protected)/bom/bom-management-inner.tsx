"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LayoutGrid,
    List,
    MoreVertical,
    Pencil,
    Copy,
    Archive,
    Trash2,
    FileStack,
    Plus,
    Search,
    Filter,
    ArrowLeft,
    Factory,
    Layers,
    Calendar,
    User,
    Tag,
    FlaskConical,
    CircleDollarSign,
    Target,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatCurrency } from "@/lib/format-currency";
import {
    type BOMEntry,
    defaultBOMs,
    entryToStored,
    mapRawToEntry,
} from "./bom-storage";

export type BOMManagementVariant = "main" | "archived";

export function BOMManagementInner({
    variant,
}: {
    variant: BOMManagementVariant;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [selectedBOM, setSelectedBOM] = useState<BOMEntry | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [allBOMs, setAllBOMs] = useState<BOMEntry[]>(defaultBOMs);
    const [deleteTarget, setDeleteTarget] = useState<BOMEntry | null>(null);

    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(variant === "main" ? ["Active", "Draft"] : ["Archived"]));
    const [phaseFilter, setPhaseFilter] = useState<Set<string>>(new Set());

    const basePath = "/bom";

    const visibleBOMs = useMemo(() => {
        return allBOMs.filter((b) => {
            const matchesStatus = statusFilter.size === 0 || statusFilter.has(b.status);
            const matchesPhase = phaseFilter.size === 0 || (b.phase && phaseFilter.has(b.phase));
            return matchesStatus && matchesPhase;
        });
    }, [allBOMs, statusFilter, phaseFilter]);

    const archivedCount = useMemo(
        () => allBOMs.filter((b) => b.status === "Archived").length,
        [allBOMs]
    );

    const displayedBOM = useMemo(() => {
        if (!selectedBOM) return null;
        return allBOMs.find((b) => b.id === selectedBOM.id) ?? selectedBOM;
    }, [selectedBOM, allBOMs]);

    // Hydrate from localStorage and handle ?bom=<id> in one pass (avoids stale list on deep link)
    /* eslint-disable react-hooks/set-state-in-effect -- client-only list hydration from localStorage */
    useEffect(() => {
        let merged: BOMEntry[] = defaultBOMs;
        try {
            const saved = JSON.parse(
                localStorage.getItem("pocketworx_boms") || "[]"
            ) as unknown[];
            const mapped = saved.map((raw) =>
                mapRawToEntry(raw as Record<string, unknown>)
            );
            merged = [...mapped, ...defaultBOMs];
        } catch {
            // keep defaultBOMs
        }
        setAllBOMs(merged);

        const id = searchParams.get("bom");
        if (id) {
            const bom = merged.find((b) => b.id === id);
            if (bom) {
                setSelectedBOM(bom);
                setSheetOpen(true);
            }
            router.replace(basePath, { scroll: false });
        }
    }, [searchParams, router, basePath]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Sync helper — persist user-created BOMs back to localStorage
    const syncToStorage = useCallback((boms: BOMEntry[]) => {
        const defaultIds = new Set(defaultBOMs.map((b) => b.id));
        const userBoms = boms
            .filter((b) => !defaultIds.has(b.id))
            .map(entryToStored);
        localStorage.setItem("pocketworx_boms", JSON.stringify(userBoms));
    }, []);

    const handleRowClick = (bom: BOMEntry) => {
        setSelectedBOM(bom);
        setSheetOpen(true);
    };

    // ─── Row Actions ─────────────────────────────────────────────────
    const handleEdit = useCallback((bom: BOMEntry) => {
        // Store the BOM data to edit in sessionStorage so the create page can load it
        sessionStorage.setItem("pocketworx_edit_bom", JSON.stringify(bom));
        router.push("/bom/create?edit=" + bom.id);
    }, [router]);

    const handleDuplicate = useCallback((bom: BOMEntry) => {
        const duplicate: BOMEntry = {
            ...bom,
            id: `BOM-${Date.now().toString().slice(-4)}`,
            name: `${bom.name} (Copy)`,
            status: "Draft",
            lastModified: "Just now",
            author: "Current User",
            componentCount:
                bom.componentRows && bom.componentRows.length > 0
                    ? undefined
                    : bom.components,
        };
        setAllBOMs((prev) => {
            const next = [duplicate, ...prev];
            syncToStorage(next);
            return next;
        });
    }, [syncToStorage]);

    const handleArchive = useCallback((bom: BOMEntry) => {
        setAllBOMs((prev) => {
            const next = prev.map((b) =>
                b.id === bom.id
                    ? { ...b, status: b.status === "Archived" ? "Active" : "Archived", lastModified: "Just now" }
                    : b
            );
            syncToStorage(next);
            return next;
        });
    }, [syncToStorage]);

    const handleDeleteConfirm = useCallback(() => {
        if (!deleteTarget) return;
        const removedId = deleteTarget.id;
        setAllBOMs((prev) => {
            const next = prev.filter((b) => b.id !== removedId);
            syncToStorage(next);
            return next;
        });
        setDeleteTarget(null);
        if (selectedBOM?.id === removedId) {
            setSheetOpen(false);
            setSelectedBOM(null);
        }
    }, [deleteTarget, syncToStorage, selectedBOM?.id]);

    const getStatusBadgeVariant = (status: string) => {
        if (status === "Active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
        if (status === "Draft") return "border-blue-200 bg-blue-50 text-blue-700";
        return "border-neutral-200 bg-neutral-100 text-neutral-600";
    };

    const handleSheetEdit = useCallback(() => {
        if (!displayedBOM) return;
        handleEdit(displayedBOM);
        setSheetOpen(false);
    }, [displayedBOM, handleEdit]);

    const handleSheetArchive = useCallback(() => {
        if (!displayedBOM) return;
        handleArchive(displayedBOM);
    }, [displayedBOM, handleArchive]);

    const handleSheetDuplicate = useCallback(() => {
        if (!displayedBOM) return;
        handleDuplicate(displayedBOM);
    }, [displayedBOM, handleDuplicate]);

    const COMPONENT_PREVIEW_LIMIT = 10;

    const componentLineCount = displayedBOM
        ? displayedBOM.componentRows?.length ?? displayedBOM.components
        : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Bill of Materials
                    </h1>
                    <p className="mt-1 text-neutral-500">
                        Manage active and draft BOMs. Use filters to view archived revisions.
                    </p>
                </div>
                {variant === "main" ? (
                    <Link href="/bom/create">
                        <Button className="bg-neutral-950 hover:bg-neutral-800 text-white shadow-md transition-colors">
                            <Plus className="mr-2 h-4 w-4" />
                            Create BOM
                        </Button>
                    </Link>
                ) : null}
            </div>

            {/* Search, Filters, and View Toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            placeholder="Search bills of materials..."
                            className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter {(statusFilter.size > 0 || phaseFilter.size > 0) ? " (Active)" : ""}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] p-2">
                            <DropdownMenuLabel className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Status</DropdownMenuLabel>
                            {["Active", "Draft", "Archived"].map((st) => (
                                <div key={st} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-neutral-50 rounded-sm cursor-pointer" onClick={() => {
                                    setStatusFilter(prev => {
                                        const next = new Set(prev);
                                        if (next.has(st)) next.delete(st);
                                        else next.add(st);
                                        return next;
                                    });
                                }}>
                                    <input type="checkbox" checked={statusFilter.has(st)} readOnly className="pointer-events-none rounded border-neutral-300 text-amber-600 focus:ring-amber-500" />
                                    <span className="text-sm font-medium text-neutral-700">{st}</span>
                                </div>
                            ))}
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuLabel className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Phase</DropdownMenuLabel>
                            {["Prototype", "Pre-Production", "Production", "End of Life"].map((ph) => (
                                <div key={ph} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-neutral-50 rounded-sm cursor-pointer" onClick={() => {
                                    setPhaseFilter(prev => {
                                        const next = new Set(prev);
                                        if (next.has(ph)) next.delete(ph);
                                        else next.add(ph);
                                        return next;
                                    });
                                }}>
                                    <input type="checkbox" checked={phaseFilter.has(ph)} readOnly className="pointer-events-none rounded border-neutral-300 text-amber-600 focus:ring-amber-500" />
                                    <span className="text-sm font-medium text-neutral-700">{ph}</span>
                                </div>
                            ))}
                            <div className="mt-2 pt-2 border-t border-neutral-100 flex justify-end">
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setStatusFilter(new Set()); setPhaseFilter(new Set()); }}>Clear all</Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* View Toggle */}
                <div className="flex items-center rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1.5 h-8 ${viewMode === "grid" ? "bg-neutral-100 text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
                    >
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Grid
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1.5 h-8 ${viewMode === "table" ? "bg-neutral-100 text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
                    >
                        <List className="mr-2 h-4 w-4" />
                        Table
                    </Button>
                </div>
            </div>

            {visibleBOMs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
                    <FileStack className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
                    <p className="text-sm font-medium text-neutral-700">
                        No BOMs found
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-xs text-neutral-500">
                        Try adjusting your search or filter settings, or create a new BOM.
                    </p>
                    {variant === "main" ? (
                        <Button
                            asChild
                            className="mt-4 bg-neutral-950 hover:bg-neutral-800 text-white transition-colors"
                        >
                            <Link href="/bom/create">Create BOM</Link>
                        </Button>
                    ) : null}
                </div>
            ) : (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                {viewMode === "grid" ? (
                    /* Grid Layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleBOMs.map((bom) => (
                            <Card key={bom.id} className="border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow group relative cursor-pointer" onClick={() => handleRowClick(bom)}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                                            <FileStack className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold text-neutral-900 line-clamp-1">{bom.name}</CardTitle>
                                            <CardDescription className="text-xs text-neutral-500 mt-1">{bom.id}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className={getStatusBadgeVariant(bom.status)}>
                                            {bom.status}
                                        </Badge>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleEdit(bom)}><Pencil className="mr-2 h-3.5 w-3.5" /> Edit BOM</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(bom)}><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleArchive(bom)}><Archive className="mr-2 h-3.5 w-3.5" /> {bom.status === "Archived" ? "Unarchive" : "Archive"}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => setDeleteTarget(bom)}><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                        <div>
                                            <p className="text-neutral-500 text-xs mb-1">Revision</p>
                                            <p className="font-medium text-neutral-900">{bom.revision}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-500 text-xs mb-1">Components</p>
                                            <p className="font-medium text-neutral-900">{bom.components}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-500 text-xs mb-1">Phase</p>
                                            <p className="font-medium text-neutral-900 truncate">{bom.phase || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-500 text-xs mb-1">Last Modified</p>
                                            <p className="font-medium text-neutral-900">{bom.lastModified}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* Table Layout */
                    <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-neutral-50/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[300px]">Name & ID</TableHead>
                                        <TableHead>Revision</TableHead>
                                        <TableHead>Components</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Phase</TableHead>
                                        <TableHead>Last Modified</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleBOMs.map((bom) => (
                                        <TableRow key={bom.id} className="cursor-pointer hover:bg-neutral-50/50 transition-colors" onClick={() => handleRowClick(bom)}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50">
                                                        <FileStack className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-neutral-900">{bom.name}</p>
                                                        <p className="text-xs text-neutral-500">{bom.id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-neutral-600">{bom.revision}</TableCell>
                                            <TableCell className="text-neutral-600">{bom.components}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getStatusBadgeVariant(bom.status)}>
                                                    {bom.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-600">
                                                {bom.phase || "—"}
                                            </TableCell>
                                            <TableCell className="text-neutral-600">
                                                <p className="text-sm">{bom.lastModified}</p>
                                                <p className="text-xs text-neutral-400">{bom.author}</p>
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleEdit(bom)}><Pencil className="mr-2 h-3.5 w-3.5" /> Edit BOM</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicate(bom)}><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleArchive(bom)}><Archive className="mr-2 h-3.5 w-3.5" /> {bom.status === "Archived" ? "Unarchive" : "Archive"}</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => setDeleteTarget(bom)}><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}

                <SheetContent className="flex h-full w-[min(100vw-1rem,36rem)] flex-col gap-0 overflow-hidden border-l border-neutral-200/80 bg-white p-0 shadow-2xl sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
                    <SheetHeader className="shrink-0 space-y-0 border-b border-neutral-200/80 bg-gradient-to-br from-amber-50/90 via-white to-neutral-50/80 p-6 pb-5 pr-14">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm ring-1 ring-amber-200/50">
                                <FileStack className="h-7 w-7 text-amber-700" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                                <SheetTitle className="text-2xl font-semibold leading-tight tracking-tight text-neutral-900">
                                    {displayedBOM?.name ?? "Bill of materials"}
                                </SheetTitle>
                                <SheetDescription className="font-mono text-sm text-neutral-500">
                                    {displayedBOM
                                        ? `${displayedBOM.id} · ${displayedBOM.revision}`
                                        : "Select a BOM from the list"}
                                </SheetDescription>
                            </div>
                        </div>

                        {displayedBOM ? (
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
                                    <div className="mb-1.5 flex items-center gap-1.5 text-neutral-500">
                                        <FileStack className="h-3.5 w-3.5 text-amber-600" />
                                        <span className="text-[11px] font-medium uppercase tracking-wide">
                                            Status
                                        </span>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`${getStatusBadgeVariant(displayedBOM.status)} text-xs font-semibold`}
                                    >
                                        {displayedBOM.status}
                                    </Badge>
                                </div>
                                <div className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
                                    <div className="mb-1.5 flex items-center gap-1.5 text-neutral-500">
                                        <Layers className="h-3.5 w-3.5 text-amber-600" />
                                        <span className="text-[11px] font-medium uppercase tracking-wide">
                                            Lines
                                        </span>
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums text-neutral-900">
                                        {componentLineCount}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
                                    <div className="mb-1.5 flex items-center gap-1.5 text-neutral-500">
                                        <Tag className="h-3.5 w-3.5 text-amber-600" />
                                        <span className="text-[11px] font-medium uppercase tracking-wide">
                                            Revision
                                        </span>
                                    </div>
                                    <p className="truncate text-sm font-semibold text-neutral-900">
                                        {displayedBOM.revision}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
                                    <div className="mb-1.5 flex items-center gap-1.5 text-neutral-500">
                                        {displayedBOM.phase ? (
                                            <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
                                        ) : (
                                            <Calendar className="h-3.5 w-3.5 text-amber-600" />
                                        )}
                                        <span className="text-[11px] font-medium uppercase tracking-wide">
                                            {displayedBOM.phase ? "Phase" : "Updated"}
                                        </span>
                                    </div>
                                    <p className="truncate text-sm font-semibold text-neutral-900">
                                        {displayedBOM.phase ??
                                            displayedBOM.lastModified}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </SheetHeader>

                    <Tabs
                        key={displayedBOM?.id ?? "none"}
                        defaultValue="overview"
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <TabsList
                            variant="line"
                            className="h-auto w-full shrink-0 justify-start gap-0 rounded-none border-b border-neutral-200 bg-transparent p-0 px-6 pt-1"
                        >
                            <TabsTrigger
                                value="overview"
                                className="rounded-none border-0 border-b-2 border-transparent px-1 py-3 text-sm data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="components"
                                className="rounded-none border-0 border-b-2 border-transparent px-1 py-3 text-sm data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Components ({componentLineCount})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="overview"
                            className="min-h-0 flex-1 overflow-y-auto px-6 py-6 focus-visible:outline-none"
                        >
                            <div className="space-y-6">
                                {displayedBOM &&
                                ((displayedBOM.totalCost !== undefined &&
                                    displayedBOM.totalCost > 0) ||
                                    displayedBOM.targetQty !== undefined) ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {displayedBOM.totalCost !== undefined &&
                                        displayedBOM.totalCost > 0 ? (
                                            <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-200/80">
                                                    <CircleDollarSign className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                        Roll-up cost
                                                    </p>
                                                    <p className="text-lg font-semibold text-neutral-900">
                                                        {formatCurrency(
                                                            displayedBOM.totalCost
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                        {displayedBOM.targetQty !== undefined ? (
                                            <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-200/80">
                                                    <Target className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                        Target qty
                                                    </p>
                                                    <p className="text-lg font-semibold text-neutral-900">
                                                        {displayedBOM.targetQty}
                                                        {displayedBOM.assemblyUom
                                                            ? ` ${displayedBOM.assemblyUom}`
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                <div>
                                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                        Record
                                    </h4>
                                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="flex gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                                            <User className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                                            <div>
                                                <dt className="text-xs text-neutral-500">
                                                    Author
                                                </dt>
                                                <dd className="mt-0.5 font-medium text-neutral-900">
                                                    {displayedBOM?.author ?? "—"}
                                                </dd>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                                            <div>
                                                <dt className="text-xs text-neutral-500">
                                                    Last modified
                                                </dt>
                                                <dd className="mt-0.5 font-medium text-neutral-900">
                                                    {displayedBOM?.lastModified ??
                                                        "—"}
                                                </dd>
                                            </div>
                                        </div>
                                        {displayedBOM?.cpn ? (
                                            <div className="sm:col-span-2 flex gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                                                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                                                <div>
                                                    <dt className="text-xs text-neutral-500">
                                                        CPN
                                                    </dt>
                                                    <dd className="mt-0.5 font-mono text-sm font-medium text-neutral-900">
                                                        {displayedBOM.cpn}
                                                    </dd>
                                                </div>
                                            </div>
                                        ) : null}
                                    </dl>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                        Description
                                    </h4>
                                    <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5 text-[15px] leading-relaxed text-neutral-700">
                                        {displayedBOM?.description?.trim() ? (
                                            <p className="whitespace-pre-wrap">
                                                {displayedBOM.description.trim()}
                                            </p>
                                        ) : (
                                            <p className="text-neutral-400">
                                                No description yet. Add one when you
                                                create or edit this BOM.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="components"
                            className="min-h-0 flex-1 overflow-y-auto px-6 py-6 focus-visible:outline-none"
                        >
                            <div className="sticky top-0 z-[1] -mx-6 mb-4 border-b border-neutral-100 bg-white/95 px-6 pb-3 backdrop-blur-sm">
                                <h4 className="text-sm font-semibold text-neutral-900">
                                    Parts on this assembly
                                </h4>
                                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                    Each row is one part required to build this BOM
                                    (quantity per assembly).
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">
                                    {displayedBOM &&
                                    displayedBOM.componentRows &&
                                    displayedBOM.componentRows.length > 0
                                        ? `Showing ${Math.min(COMPONENT_PREVIEW_LIMIT, displayedBOM.componentRows.length)} of ${displayedBOM.componentRows.length} saved BOM lines`
                                        : displayedBOM
                                          ? `${componentLineCount} line${componentLineCount === 1 ? "" : "s"} on record — open the editor to add part rows.`
                                          : "—"}
                                </p>
                            </div>

                            {displayedBOM &&
                            displayedBOM.componentRows &&
                            displayedBOM.componentRows.length > 0 ? (
                                <div className="space-y-3">
                                    {displayedBOM.componentRows
                                        .slice(0, COMPONENT_PREVIEW_LIMIT)
                                        .map((row) => {
                                            const hasDesc = !!row.description?.trim();
                                            const primary = hasDesc
                                                ? row.description!.trim()
                                                : row.partNumber?.trim() || "—";
                                            const partNo =
                                                row.partNumber?.trim() || null;
                                            const mpn = row.mpn?.trim() || null;
                                            const mfr =
                                                row.manufacturer?.trim() || null;
                                            const refDes =
                                                row.refDesignator?.trim() || null;
                                            const extCost =
                                                row.qpa * row.unitCost;
                                            const showCost =
                                                typeof row.unitCost ===
                                                    "number" &&
                                                row.unitCost > 0;
                                            return (
                                                <div
                                                    key={row.id}
                                                    className="relative overflow-hidden rounded-xl border border-neutral-100 bg-white py-4 pl-5 pr-4 shadow-sm ring-1 ring-neutral-100/80 transition-shadow hover:shadow-md"
                                                >
                                                    <div
                                                        className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-amber-400 to-orange-500"
                                                        aria-hidden
                                                    />
                                                    <div className="grid gap-4 pl-2 sm:grid-cols-[1fr_auto] sm:items-start">
                                                        <div className="min-w-0 space-y-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md bg-neutral-100 px-1.5 text-xs font-semibold tabular-nums text-neutral-600">
                                                                    #
                                                                    {
                                                                        row.lineNumber
                                                                    }
                                                                </span>
                                                                {row.level >
                                                                1 ? (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600"
                                                                    >
                                                                        Level{" "}
                                                                        {
                                                                            row.level
                                                                        }
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                            <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-neutral-900">
                                                                {primary}
                                                            </p>
                                                            {hasDesc &&
                                                            partNo ? (
                                                                <p className="font-mono text-xs text-neutral-600">
                                                                    <span className="font-sans text-neutral-400">
                                                                        Part no.{" "}
                                                                    </span>
                                                                    {partNo}
                                                                </p>
                                                            ) : null}
                                                            {mpn ? (
                                                                <p className="text-xs text-neutral-600">
                                                                    <span className="text-neutral-400">
                                                                        MPN{" "}
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        {mpn}
                                                                    </span>
                                                                </p>
                                                            ) : null}
                                                            {mfr ? (
                                                                <p className="flex items-center gap-1.5 text-xs text-neutral-600">
                                                                    <Factory className="h-3 w-3 shrink-0 text-neutral-400" />
                                                                    <span className="text-neutral-400">
                                                                        Mfr{" "}
                                                                    </span>
                                                                    {mfr}
                                                                </p>
                                                            ) : null}
                                                            {refDes ? (
                                                                <p className="text-xs text-neutral-600">
                                                                    <span className="text-neutral-400">
                                                                        Ref des{" "}
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        {refDes}
                                                                    </span>
                                                                </p>
                                                            ) : null}
                                                            {row.catalogSku ? (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="w-fit border-violet-200 bg-violet-50 text-[10px] text-violet-800"
                                                                >
                                                                    Inventory
                                                                    link ·{" "}
                                                                    {
                                                                        row.catalogSku
                                                                    }
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        <div className="flex shrink-0 flex-col items-end gap-1 border-t border-neutral-100 pt-3 text-right sm:border-t-0 sm:pt-0 sm:pl-2">
                                                            <span className="text-sm font-semibold tabular-nums text-neutral-900">
                                                                ×{row.qpa}{" "}
                                                                <span className="text-xs font-normal text-neutral-500">
                                                                    {row.uom}
                                                                </span>
                                                            </span>
                                                            {showCost ? (
                                                                <>
                                                                    <span className="text-xs text-neutral-500">
                                                                        Unit{" "}
                                                                        {formatCurrency(
                                                                            row.unitCost
                                                                        )}
                                                                    </span>
                                                                    <span className="text-sm font-semibold tabular-nums text-neutral-800">
                                                                        Ext.{" "}
                                                                        {formatCurrency(
                                                                            extCost
                                                                        )}
                                                                    </span>
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {displayedBOM.componentRows.length >
                                    COMPONENT_PREVIEW_LIMIT ? (
                                        <p className="pt-2 text-center text-xs text-neutral-400">
                                            +{" "}
                                            {displayedBOM.componentRows.length -
                                                COMPONENT_PREVIEW_LIMIT}{" "}
                                            more lines — use Edit BOM to view and
                                            edit the full list.
                                        </p>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-neutral-200 bg-gradient-to-b from-neutral-50/80 to-white px-6 py-12 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                                        <Layers className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <p className="text-sm font-medium text-neutral-700">
                                        No saved component lines yet
                                    </p>
                                    <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-neutral-500">
                                        {displayedBOM && displayedBOM.components > 0
                                            ? `This BOM shows ${displayedBOM.components} line${displayedBOM.components === 1 ? "" : "s"} in the catalog, but there are no detailed rows stored. Open the editor to add parts.`
                                            : "Open the editor to add parts and build out this BOM."}
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <SheetFooter className="shrink-0 gap-3 border-t border-neutral-200 bg-neutral-50/80 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md sm:flex-row sm:items-stretch">
                        <Button
                            className="min-h-11 flex-1 bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-sm hover:from-amber-500 hover:to-orange-400"
                            disabled={!displayedBOM}
                            onClick={handleSheetEdit}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit BOM
                        </Button>
                        <Button
                            variant="outline"
                            className="min-h-11 flex-1 border-neutral-200 bg-white/80"
                            disabled={!displayedBOM}
                            onClick={handleSheetArchive}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            {displayedBOM?.status === "Archived"
                                ? "Unarchive"
                                : "Archive"}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="min-h-11 min-w-11 shrink-0 border-neutral-200 bg-white/80"
                                    disabled={!displayedBOM}
                                    aria-label="More actions"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuLabel>More</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleSheetDuplicate}
                                    disabled={!displayedBOM}
                                >
                                    <Copy className="mr-2 h-3.5 w-3.5" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                    onClick={() =>
                                        displayedBOM && setDeleteTarget(displayedBOM)
                                    }
                                    disabled={!displayedBOM}
                                >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete BOM</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.id})?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
