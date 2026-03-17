"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List, MoreVertical, Pencil, Copy, Archive, Trash2, FileStack, Plus, Search, Filter } from "lucide-react";
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
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

const sampleBOMs = [
    { id: "BOM-127", name: "PWX Gateway v3.2", components: 24, revision: "Rev C", status: "Active", author: "Alice Smith", lastModified: "2 hours ago" },
    { id: "BOM-126", name: "PWX Sensor Node v2", components: 18, revision: "Rev B", status: "Active", author: "Bob Jones", lastModified: "1 day ago" },
    { id: "BOM-125", name: "PWX Base Station", components: 42, revision: "Rev A", status: "Draft", author: "Charlie Brown", lastModified: "3 days ago" },
    { id: "BOM-124", name: "PWX Gateway v3.1", components: 22, revision: "Rev B", status: "Archived", author: "Diana Prince", lastModified: "1 week ago" },
    { id: "BOM-123", name: "Power Supply Module", components: 11, revision: "Rev D", status: "Active", author: "Eve Adams", lastModified: "2 weeks ago" },
];

export default function BOMPage() {
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [selectedBOM, setSelectedBOM] = useState<typeof sampleBOMs[0] | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleRowClick = (bom: typeof sampleBOMs[0]) => {
        setSelectedBOM(bom);
        setSheetOpen(true);
    };

    const getStatusBadgeVariant = (status: string) => {
        if (status === "Active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
        if (status === "Draft") return "border-blue-200 bg-blue-50 text-blue-700";
        return "border-neutral-200 bg-neutral-100 text-neutral-600";
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Bill of Materials
                    </h1>
                    <p className="mt-1 text-neutral-500">
                        Manage product BOMs and component requirements
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-orange-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Create BOM
                </Button>
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
                    <Button variant="outline" className="border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
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

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                {viewMode === "grid" ? (
                    /* Grid Layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sampleBOMs.map((bom) => (
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
                                                    <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit BOM</DropdownMenuItem>
                                                    <DropdownMenuItem><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                                                    <DropdownMenuItem><Archive className="mr-2 h-3.5 w-3.5" /> Archive</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
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
                                            <p className="text-neutral-500 text-xs mb-1">Author</p>
                                            <p className="font-medium text-neutral-900 truncate">{bom.author}</p>
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
                                        <TableHead>Last Modified</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sampleBOMs.map((bom) => (
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
                                                        <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit BOM</DropdownMenuItem>
                                                        <DropdownMenuItem><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                                                        <DropdownMenuItem><Archive className="mr-2 h-3.5 w-3.5" /> Archive</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
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

                {/* Dummy Slide-out Panel */}
                <SheetContent className="sm:max-w-md w-[90vw] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                <FileStack className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl">{selectedBOM?.name}</SheetTitle>
                                <SheetDescription className="text-sm">{selectedBOM?.id} · {selectedBOM?.revision}</SheetDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                             <Badge variant="secondary" className={selectedBOM ? getStatusBadgeVariant(selectedBOM.status) : ""}>
                                {selectedBOM?.status}
                            </Badge>
                            <span className="text-xs text-neutral-500 border border-neutral-200 rounded-md px-2 py-0.5">
                                {selectedBOM?.components} Components
                            </span>
                        </div>
                    </SheetHeader>
                    
                    <div className="space-y-6">
                         <div>
                            <h4 className="text-sm font-semibold text-neutral-900 mb-3 border-b pb-2">Details</h4>
                            <dl className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                    <dt className="text-neutral-500">Author</dt>
                                    <dd className="font-medium mt-1">{selectedBOM?.author}</dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-500">Last Modified</dt>
                                    <dd className="font-medium mt-1">{selectedBOM?.lastModified}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-neutral-500">Description</dt>
                                    <dd className="text-neutral-700 mt-1 line-clamp-3">
                                        Mock description for {selectedBOM?.name}. This dummy panel represents where a user could view the full list of constituent components, cost rollups, and manufacturing instructions for this specific iteration of the bill of materials.
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3 border-b pb-2">
                                <h4 className="text-sm font-semibold text-neutral-900">Components List</h4>
                                <Button variant="outline" size="sm" className="h-7 text-xs">View Full</Button>
                            </div>
                            <div className="space-y-3">
                                {/* Dummy Component Items */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-md border border-neutral-100 bg-neutral-50">
                                         <div>
                                            <p className="text-sm font-medium text-neutral-900">Resistor 10k 0402</p>
                                            <p className="text-xs text-neutral-500">RES-10K-0402-1</p>
                                         </div>
                                         <p className="text-sm text-neutral-700">x4</p>
                                    </div>
                                ))}
                                <div className="text-center w-full pt-2">
                                    <span className="text-xs text-neutral-400">Showing 3 of {selectedBOM?.components} components</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                             <Button className="flex-1">Edit Master BOM</Button>
                             <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Archive Revision</Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
