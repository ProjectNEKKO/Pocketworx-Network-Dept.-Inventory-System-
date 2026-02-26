import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const sampleComponents = [
    { name: "Resistor 10kΩ", sku: "RES-10K-001", stock: 142, min: 200, category: "Passive" },
    { name: "Capacitor 100µF", sku: "CAP-100U-003", stock: 580, min: 100, category: "Passive" },
    { name: "ESP32-S3 Module", sku: "MCU-ESP32S3", stock: 24, min: 50, category: "MCU" },
    { name: "LoRa SX1276", sku: "RF-LORA-1276", stock: 89, min: 30, category: "RF" },
    { name: "USB-C Connector", sku: "CON-USBC-01", stock: 312, min: 100, category: "Connector" },
    { name: "PCB Antenna 868MHz", sku: "ANT-868-PCB", stock: 15, min: 40, category: "RF" },
];

export default function ComponentsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Components
                    </h1>
                    <p className="mt-1 text-neutral-400">
                        Track and manage electronic components inventory
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Component
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search components by name or SKU..."
                        className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-neutral-500"
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Component List */}
            <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">All Components</CardTitle>
                    <CardDescription className="text-neutral-500">
                        {sampleComponents.length} components tracked
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sampleComponents.map((comp) => {
                            const isLow = comp.stock < comp.min;
                            return (
                                <div
                                    key={comp.sku}
                                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                                            <Cpu className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{comp.name}</p>
                                            <p className="text-xs text-neutral-500">{comp.sku}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden text-right sm:block">
                                            <p className="text-xs text-neutral-400">
                                                Stock:{" "}
                                                <span className={isLow ? "text-amber-400 font-medium" : "text-white"}>{comp.stock}</span>
                                                <span className="text-neutral-600"> / {comp.min} min</span>
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs border-white/10 bg-white/5 text-neutral-400"
                                        >
                                            {comp.category}
                                        </Badge>
                                        {isLow && (
                                            <Badge
                                                variant="secondary"
                                                className="border-amber-500/20 bg-amber-500/10 text-amber-400"
                                            >
                                                Low Stock
                                            </Badge>
                                        )}
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
