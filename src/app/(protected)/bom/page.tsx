import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileStack, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const sampleBOMs = [
    { id: "BOM-127", name: "PWX Gateway v3.2", components: 24, revision: "Rev C", status: "Active" },
    { id: "BOM-126", name: "PWX Sensor Node v2", components: 18, revision: "Rev B", status: "Active" },
    { id: "BOM-125", name: "PWX Base Station", components: 42, revision: "Rev A", status: "Draft" },
    { id: "BOM-124", name: "PWX Gateway v3.1", components: 22, revision: "Rev B", status: "Archived" },
    { id: "BOM-123", name: "Power Supply Module", components: 11, revision: "Rev D", status: "Active" },
];

export default function BOMPage() {
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

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
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

            {/* BOM List */}
            <Card className="border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900">All BOMs</CardTitle>
                    <CardDescription className="text-neutral-500">
                        {sampleBOMs.length} bills of materials
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sampleBOMs.map((bom) => (
                            <div
                                key={bom.id}
                                className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 transition-colors hover:bg-neutral-100/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                        <FileStack className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">{bom.name}</p>
                                        <p className="text-xs text-neutral-500">
                                            {bom.id} · {bom.revision} · {bom.components} components
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        bom.status === "Active"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : bom.status === "Draft"
                                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                                : "border-neutral-200 bg-neutral-100 text-neutral-600"
                                    }
                                >
                                    {bom.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
