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
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Bill of Materials
                    </h1>
                    <p className="mt-1 text-neutral-400">
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
                        className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-neutral-500"
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* BOM List */}
            <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">All BOMs</CardTitle>
                    <CardDescription className="text-neutral-500">
                        {sampleBOMs.length} bills of materials
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sampleBOMs.map((bom) => (
                            <div
                                key={bom.id}
                                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                        <FileStack className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{bom.name}</p>
                                        <p className="text-xs text-neutral-500">
                                            {bom.id} · {bom.revision} · {bom.components} components
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        bom.status === "Active"
                                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                            : bom.status === "Draft"
                                                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                                : "border-white/10 bg-white/5 text-neutral-500"
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
