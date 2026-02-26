import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Warehouse as WarehouseIcon, Plus, Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

const sampleLocations = [
    { name: "Warehouse A", zone: "Main Building", bins: 120, utilization: 87, status: "Active" },
    { name: "Warehouse B", zone: "Annex East", bins: 80, utilization: 62, status: "Active" },
    { name: "Warehouse C", zone: "Annex West", bins: 60, utilization: 94, status: "Near Full" },
    { name: "Cold Storage", zone: "Basement", bins: 30, utilization: 45, status: "Active" },
    { name: "Overflow Area", zone: "External", bins: 40, utilization: 12, status: "Low Use" },
];

export default function WarehousePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Warehouse
                    </h1>
                    <p className="mt-1 text-neutral-400">
                        Manage storage locations and bin assignments
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-green-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search locations..."
                        className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-neutral-500"
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Location Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sampleLocations.map((loc) => (
                    <Card
                        key={loc.name}
                        className="border-white/5 bg-neutral-900/50 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-neutral-900/80"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <WarehouseIcon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        loc.status === "Active"
                                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                            : loc.status === "Near Full"
                                                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                                : "border-white/10 bg-white/5 text-neutral-500"
                                    }
                                >
                                    {loc.status}
                                </Badge>
                            </div>
                            <CardTitle className="mt-3 text-white">{loc.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-neutral-500">
                                <MapPin className="h-3 w-3" />
                                {loc.zone}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Bins</span>
                                    <span className="text-neutral-300">{loc.bins}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Utilization</span>
                                        <span className="text-neutral-300">{loc.utilization}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                                        <div
                                            className={`h-full rounded-full transition-all ${loc.utilization > 90
                                                    ? "bg-amber-500"
                                                    : loc.utilization > 70
                                                        ? "bg-blue-500"
                                                        : "bg-emerald-500"
                                                }`}
                                            style={{ width: `${loc.utilization}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
