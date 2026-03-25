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
import { useClientRole } from "@/lib/use-client-role";
import { Badge } from "@/components/ui/badge";
import { Warehouse as WarehouseIcon, Search, Filter, MapPin, Package, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const initialLocations = [
    { name: "PWX IoT Hub", zone: "PWX Office", bins: 150, utilization: 75, status: "Active" },
    { name: "Jenny's", zone: "Pasig", bins: 80, utilization: 45, status: "Active" },
];

const mockComponents = [
    { name: "Antenna Sectoral 18dBi", category: "Antenna", stock: 12, location: "PWX IoT Hub" },
    { name: "Gateway 915 Indoor", category: "Gateway", stock: 5, location: "PWX IoT Hub" },
    { name: "Lora Module SX1276", category: "Module", stock: 45, location: "PWX IoT Hub" },
    { name: "RG316 Bulk Head", category: "Cable", stock: 40, location: "Jenny's" },
    { name: "N-Type Connector", category: "Connector", stock: 120, location: "Jenny's" },
];

export default function WarehousePage() {
    const { role } = useClientRole();
    const [locations, setLocations] = useState<WarehouseLocation[]>(initialLocations);
    const [search, setSearch] = useState("");
    
    // Components Dialog State
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [componentSearch, setComponentSearch] = useState("");

    const handleAddLocation = (newLocation: WarehouseLocation) => {
        setLocations((prev) => [...prev, newLocation]);
    };

    const handleImportLocations = (newLocations: WarehouseLocation[]) => {
        setLocations((prev) => [...prev, ...newLocations]);
    };

    const filtered = locations.filter(
        (loc) =>
            loc.name.toLowerCase().includes(search.toLowerCase()) ||
            loc.zone.toLowerCase().includes(search.toLowerCase())
    );

    const locationComponents = mockComponents.filter(
        (c) => 
            c.location === selectedLocation &&
            (c.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
             c.category.toLowerCase().includes(componentSearch.toLowerCase()))
    );

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
                {role === "admin" && (
                    <AddWarehouseDialog 
                        onAdd={handleAddLocation} 
                        onImport={handleImportLocations} 
                    />
                )}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search locations..."
                        className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Location Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((loc, index) => (
                    <Card
                        key={`${loc.name}-${index}`}
                        onClick={() => {
                            setSelectedLocation(loc.name);
                            setComponentSearch("");
                        }}
                        className="cursor-pointer border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5"
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

            {/* Components Dialog */}
            <Dialog open={!!selectedLocation} onOpenChange={(open) => !open && setSelectedLocation(null)}>
                <DialogContent className="sm:max-w-[600px] text-black overflow-hidden rounded-[20px] p-0 border border-neutral-200/60 shadow-xl bg-white mx-auto w-[90vw]">
                    <DialogHeader className="px-5 sm:px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                            <WarehouseIcon className="h-5 w-5 text-emerald-600" />
                            {selectedLocation} Components
                        </DialogTitle>
                        <CardDescription>
                            All inventory items currently stored in this location
                        </CardDescription>
                    </DialogHeader>
                    
                    <div className="p-5 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <Input
                                placeholder="Search components by name or category..."
                                className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500"
                                value={componentSearch}
                                onChange={(e) => setComponentSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-2">
                            {locationComponents.length > 0 ? (
                                locationComponents.map((comp, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-900">{comp.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="border-neutral-200 text-neutral-500 text-[10px] uppercase font-semibold h-5 px-1.5">
                                                        {comp.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-neutral-900">{comp.stock}</p>
                                            <p className="text-xs text-neutral-500">In Stock</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-neutral-500">
                                    <Package className="h-8 w-8 mx-auto mb-3 text-neutral-300" />
                                    <p className="text-sm">No components found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
