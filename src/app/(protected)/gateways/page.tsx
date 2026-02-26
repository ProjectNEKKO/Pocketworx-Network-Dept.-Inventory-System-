import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const sampleGateways = [
    { id: "GW-1042", status: "Online", location: "Warehouse A", signal: "Strong", lastSeen: "Just now" },
    { id: "GW-1041", status: "Online", location: "Warehouse B", signal: "Good", lastSeen: "2 min ago" },
    { id: "GW-1040", status: "Offline", location: "Warehouse C", signal: "None", lastSeen: "3 hrs ago" },
    { id: "GW-1039", status: "Online", location: "Floor 1", signal: "Weak", lastSeen: "1 min ago" },
    { id: "GW-1038", status: "Online", location: "Floor 2", signal: "Strong", lastSeen: "Just now" },
];

export default function GatewaysPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Gateways
                    </h1>
                    <p className="mt-1 text-neutral-400">
                        Manage and monitor your gateway devices
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Gateway
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search gateways..."
                        className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-neutral-500"
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Gateway List */}
            <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">All Gateways</CardTitle>
                    <CardDescription className="text-neutral-500">
                        {sampleGateways.length} gateways registered
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sampleGateways.map((gw) => (
                            <div
                                key={gw.id}
                                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Radio className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{gw.id}</p>
                                        <p className="text-xs text-neutral-500">{gw.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden text-right sm:block">
                                        <p className="text-xs text-neutral-500">Signal: {gw.signal}</p>
                                        <p className="text-xs text-neutral-600">{gw.lastSeen}</p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            gw.status === "Online"
                                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                : "border-red-500/20 bg-red-500/10 text-red-400"
                                        }
                                    >
                                        {gw.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
