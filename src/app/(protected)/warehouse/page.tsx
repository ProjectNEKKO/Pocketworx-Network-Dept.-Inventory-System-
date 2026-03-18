"use client";

import { useState } from "react";
import { AddWarehouseDialog, WarehouseLocation } from "./add_warehouse";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Warehouse as WarehouseIcon, Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

const initialLocations = [
    { name: "Main Warehouse", zone: "Main Building", bins: 150, utilization: 75, status: "Active" },
    { name: "Secondary Warehouse", zone: "Annex", bins: 80, utilization: 45, status: "Active" },
];

export default function WarehousePage() {
    const [locations, setLocations] = useState<WarehouseLocation[]>(initialLocations);

    const handleAddLocation = (newLocation: WarehouseLocation) => {
        setLocations((prev) => [...prev, newLocation]);
    };

    const handleImportLocations = (newLocations: WarehouseLocation[]) => {
        setLocations((prev) => [...prev, ...newLocations]);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Warehouse
                    </h1>
                    <p className="mt-1 text-neutral-500">
                        Manage storage locations and bin assignments
                    </p>
                </div>
                <AddWarehouseDialog 
                    onAdd={handleAddLocation} 
                    onImport={handleImportLocations} 
                />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search locations..."
                        className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500"
                    />
                </div>
                <Button variant="outline" className="border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Location Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {locations.map((loc, index) => (
                    <Card
                        key={`${loc.name}-${index}`}
                        className="border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                    <WarehouseIcon className="h-5 w-5 text-emerald-600" />
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        loc.status === "Active"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : loc.status === "Near Full"
                                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                                : "border-neutral-200 bg-neutral-100 text-neutral-600"
                                    }
                                >
                                    {loc.status}
                                </Badge>
                            </div>
                            <CardTitle className="mt-3 text-neutral-900">{loc.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-neutral-500">
                                <MapPin className="h-3 w-3" />
                                {loc.zone}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Bins</span>
                                    <span className="text-neutral-700 font-medium">{loc.bins}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Utilization</span>
                                        <span className="text-neutral-700 font-medium">{loc.utilization}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
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
