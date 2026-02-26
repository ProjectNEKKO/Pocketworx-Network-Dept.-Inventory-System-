import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Radio,
    Cpu,
    FileStack,
    Warehouse,
    TrendingUp,
    Package,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";

const stats = [
    {
        label: "Total Gateways",
        value: "248",
        change: "+12",
        icon: Radio,
        color: "from-blue-500 to-cyan-400",
        shadow: "shadow-blue-500/20",
    },
    {
        label: "Components",
        value: "1,842",
        change: "+67",
        icon: Cpu,
        color: "from-violet-500 to-purple-400",
        shadow: "shadow-violet-500/20",
    },
    {
        label: "Active BOMs",
        value: "36",
        change: "+3",
        icon: FileStack,
        color: "from-amber-500 to-orange-400",
        shadow: "shadow-amber-500/20",
    },
    {
        label: "Warehouse Items",
        value: "5,419",
        change: "+154",
        icon: Warehouse,
        color: "from-emerald-500 to-green-400",
        shadow: "shadow-emerald-500/20",
    },
];

const recentActivity = [
    {
        action: "Gateway GW-1042 added",
        time: "2 min ago",
        status: "success" as const,
    },
    {
        action: "BOM #127 updated",
        time: "15 min ago",
        status: "info" as const,
    },
    {
        action: "Low stock: Resistor 10kΩ",
        time: "1 hr ago",
        status: "warning" as const,
    },
    {
        action: "Component batch received",
        time: "3 hrs ago",
        status: "success" as const,
    },
    {
        action: "Warehouse audit completed",
        time: "5 hrs ago",
        status: "success" as const,
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Dashboard
                </h1>
                <p className="mt-1 text-neutral-400">
                    Overview of your inventory system
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        className="border-white/5 bg-neutral-900/50 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-neutral-900/80"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-lg`}
                                >
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-xs font-medium text-emerald-400">
                                    {stat.change}
                                </span>
                                <span className="text-xs text-neutral-500">this week</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-neutral-500">
                            Latest actions across your inventory
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
                                >
                                    {item.status === "success" && (
                                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                                    )}
                                    {item.status === "warning" && (
                                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                                    )}
                                    {item.status === "info" && (
                                        <Package className="h-4 w-4 shrink-0 text-blue-400" />
                                    )}
                                    <span className="flex-1 text-sm text-neutral-300">
                                        {item.action}
                                    </span>
                                    <span className="text-xs text-neutral-500">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">System Status</CardTitle>
                        <CardDescription className="text-neutral-500">
                            Current system health
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <span className="text-sm text-neutral-300">Database</span>
                            <Badge
                                variant="secondary"
                                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            >
                                Online
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <span className="text-sm text-neutral-300">API</span>
                            <Badge
                                variant="secondary"
                                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            >
                                Healthy
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <span className="text-sm text-neutral-300">Sync</span>
                            <Badge
                                variant="secondary"
                                className="border-amber-500/20 bg-amber-500/10 text-amber-400"
                            >
                                Pending
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <span className="text-sm text-neutral-300">Last Backup</span>
                            <span className="text-xs text-neutral-500">Today, 04:00 AM</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
