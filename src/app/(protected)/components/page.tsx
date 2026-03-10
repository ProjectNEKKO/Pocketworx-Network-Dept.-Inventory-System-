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
import { Cpu, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddComponentsDialog, ComponentItem } from "./add_components";

const initialComponents: ComponentItem[] = [
    { name: "10ft RSC Pipe 1.5inch", sku: "PIPE-RSC-10FT-15", stock: 50, min: 100, category: "Hardware" },
    { name: "2 - Pin Male Plug", sku: "ELEC-2PIN-M", stock: 200, min: 100, category: "Accessories" },
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
];

export default function ComponentsPage() {
    const [components, setComponents] = useState<ComponentItem[]>(initialComponents);

    const handleAddComponent = (newComp: ComponentItem) => {
        setComponents([...components, newComp]);
    };

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
                <AddComponentsDialog 
                    onAdd={handleAddComponent} 
                    existingSkus={components.map(c => c.sku)} 
                />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search components by name or SKU..."
                        className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500"
                    />
                </div>
                <Button variant="outline" className="border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Component List */}
            <Card className="border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900">All Components</CardTitle>
                    <CardDescription className="text-neutral-500">
                        {components.length} components tracked
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {components.map((comp) => {
                            const stockPercent = Math.round((comp.stock / comp.min) * 100);
                            let status = "Critical";
                            let statusClasses = "border-red-200 bg-red-50 text-red-700";
                            let textClass = "text-red-700 font-medium";

                            if (stockPercent >= 71) {
                                status = "Good";
                                statusClasses = "border-emerald-200 bg-emerald-50 text-emerald-700";
                                textClass = "text-emerald-700 font-medium";
                            } else if (stockPercent >= 31) {
                                status = "Fair";
                                statusClasses = "border-blue-200 bg-blue-50 text-blue-700";
                                textClass = "text-blue-700 font-medium";
                            } else if (stockPercent >= 11) {
                                status = "Low";
                                statusClasses = "border-amber-200 bg-amber-50 text-amber-700";
                                textClass = "text-amber-700 font-medium";
                            }

                            return (
                                <div
                                    key={comp.sku}
                                    className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 transition-colors hover:bg-neutral-100/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                                            <Cpu className="h-5 w-5 text-violet-600" />
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
                                            className={statusClasses}
                                        >
                                            {status}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
