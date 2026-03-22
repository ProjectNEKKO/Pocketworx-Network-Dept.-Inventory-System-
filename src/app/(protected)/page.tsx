"use client";

import { useState } from "react";
import Link from "next/link";

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
    Clock,
    PackagePlus,
    RefreshCw,
    PlusCircle,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const stats = [
    {
        label: "Registered Gateways",
        value: "10",
        change: "Active devices",
        icon: Radio,
        color: "from-blue-500 to-sky-400",
        shadow: "shadow-blue-500/20",
        href: "/gateways",
    },
    {
        label: "Components",
        value: "40",
        change: "In inventory",
        icon: Cpu,
        color: "from-violet-500 to-purple-400",
        shadow: "shadow-violet-500/20",
        href: "/components",
    },
    {
        label: "Total BOMs",
        value: "5",
        change: "3 active",
        icon: FileStack,
        color: "from-amber-500 to-orange-400",
        shadow: "shadow-amber-500/20",
        href: "/bom",
    },
    {
        label: "Critical Alerts",
        value: "6",
        change: "Low stock items",
        icon: AlertTriangle,
        color: "from-red-500 to-rose-400",
        shadow: "shadow-red-500/20",
    },
];

const criticalComponents = [
    { name: "Enclosure Dimension 168X149 mm", sku: "DIM-168-149", stock: 10, min: 50, warehouse: "PWX IoT Hub", category: "Enclosure", status: "Critical" },
    { name: "2 hole C Clamp 1-1/2' RGD", sku: "HW-CCLAMP-15", stock: 5, min: 100, warehouse: "PWX IoT Hub", category: "Accessories", status: "Critical" },
    { name: "Outlet 4- Gang (For Extension)", sku: "ELEC-OUT-4G", stock: 8, min: 100, warehouse: "Genis", category: "Accessories", status: "Critical" },
    { name: "Tofu Heatsink (White)", sku: "HS-TOFU-WHT", stock: 2, min: 100, warehouse: "PWX IoT Hub", category: "Hardware", status: "Critical" },
    { name: "M5 Bolts and Nuts", sku: "HW-M5-BN", stock: 10, min: 300, warehouse: "Genis", category: "Hardware", status: "Critical" },
    { name: "CAT5e Cable", sku: "CBL-CAT5E", stock: 15, min: 200, warehouse: "PWX IoT Hub", category: "Networking", status: "Critical" }
];

const chartData = {
    Today: [
        { name: "08:00", w1: 2, w2: 35 },
        { name: "10:00", w1: 10, w2: 25 },
        { name: "12:00", w1: 8, w2: 35 },
        { name: "14:00", w1: 8, w2: 18 },
        { name: "16:00", w1: 3, w2: 30 },
        { name: "18:00", w1: 4, w2: 35 },
    ],
    "This Month": [
        { name: "Week 1", w1: 15, w2: 35 },
        { name: "Week 2", w1: 20, w2: 50 },
        { name: "Week 3", w1: 12, w2: 25 },
        { name: "Week 4", w1: 8, w2: 45 },
    ],
    "This Year": [
        { name: "Jan", w1: 16, w2: 50 },
        { name: "Feb", w1: 14, w2: 70 },
        { name: "Mar", w1: 9, w2: 35 },
        { name: "Apr", w1: 15, w2: 80 },
        { name: "May", w1: 24, w2: 60 },
        { name: "Jun", w1: 17, w2: 65 },
        { name: "Jul", w1: 20, w2: 70 },
        { name: "Aug", w1: 13, w2: 45 },
    ],
};

const donutData = [
    { name: "Components",  value: 40, color: "#8b5cf6" },
    { name: "Gateways",    value: 10,  color: "#3b82f6" },
    { name: "Active BOMs", value: 3,   color: "#f59e0b" },
    { name: "Critical Alerts", value: 6, color: "#ef4444" },
];
const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

const recentActivity = [
    { icon: PackagePlus, color: "bg-violet-100 text-violet-600",  action: "Component Added",      detail: "915Mhz Lora Antenna 3.8dBi × 10",          time: "2 min ago" },
    { icon: Radio,       color: "bg-blue-100 text-blue-600",      action: "Gateway Registered",   detail: "Gateway 915 Outdoor — PWX IoT Hub",       time: "18 min ago" },
    { icon: RefreshCw,   color: "bg-amber-100 text-amber-600",    action: "Stock Updated",        detail: "CAT5e Cable: 120 → 145 pcs",              time: "1 hr ago" },
    { icon: FileStack,   color: "bg-orange-100 text-orange-600",  action: "BOM Created",          detail: "PWX Gateway v3.3 — Rev A",               time: "3 hrs ago" },
    { icon: PackagePlus, color: "bg-violet-100 text-violet-600",  action: "Component Added",      detail: "M5 Bolts and Nuts × 200",                time: "5 hrs ago" },
    { icon: RefreshCw,   color: "bg-emerald-100 text-emerald-600",action: "Stock Updated",        detail: "PoE Adaptor 24v: 40 → 55 pcs",           time: "Yesterday" },
    { icon: Radio,       color: "bg-blue-100 text-blue-600",      action: "Gateway Registered",   detail: "Femto Outdoor — Genis",                  time: "Yesterday" },
    { icon: PlusCircle,  color: "bg-emerald-100 text-emerald-600",action: "Location Added",       detail: "PWX IoT Hub — Zone B (12 bins)",         time: "2 days ago" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="relative mb-2">
                <div className="rounded-xl bg-neutral-900 px-4 py-2 shadow-2xl border border-neutral-800">
                    <p className="text-[10px] font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">{label}</p>
                    <div className="space-y-1.5">
                        {[...payload].sort((a: any, b: any) => b.value - a.value).map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-[11px] font-medium text-white/90">
                                        {entry.name === "w1" ? "PWX IoT Hub" : "Genis"}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-white">
                                    {entry.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-neutral-900" />
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isCriticalAlertsOpen, setIsCriticalAlertsOpen] = useState(false);
    const [period, setPeriod] = useState<keyof typeof chartData>("This Year");

    const activeData = chartData[period];
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                    Dashboard
                </h1>
                <p className="mt-1 text-neutral-500">
                    Overview of your inventory system
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const CardComponent = (
                        <Card className="border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 hover:shadow-md cursor-pointer hover:-translate-y-0.5 h-full">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 text-left">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold text-neutral-900 text-left">{stat.value}</p>
                                    </div>
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-sm`}
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
                    );

                    if (stat.label === "Critical Alerts") {
                        return (
                            <button key={stat.label} onClick={() => setIsCriticalAlertsOpen(true)} className="block w-full h-full text-left outline-none">
                                {CardComponent}
                            </button>
                        );
                    }

                    return (
                        <Link key={stat.label} href={stat.href} className="block w-full h-full outline-none">
                            {CardComponent}
                        </Link>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Gateway Components Analytics */}
                <Card className="border-neutral-200 bg-white shadow-sm lg:col-span-2 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 px-6 pt-6">
                        <div>
                            <CardTitle className="text-xl font-bold text-neutral-900">Gateway Location</CardTitle>
                            <CardDescription className="text-neutral-500 mt-1">PWX IoT Hub and Genis</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-neutral-50 p-1 border border-neutral-100">
                            {(Object.keys(chartData) as Array<keyof typeof chartData>).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 py-1.5 text-xs font-medium transition-all duration-300 rounded-full ${
                                        period === p
                                            ? "bg-[#DFFF1B] text-neutral-900 font-bold shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-900"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={activeData}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorW1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorW2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2181dbff" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#2181dbff" stopOpacity={0} />
                                        </linearGradient>
                                        <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f97316" floodOpacity="0.7" />
                                        </filter>
                                        <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#5adafaff" floodOpacity="0.7" />
                                        </filter>
                                    </defs>
                                    <CartesianGrid 
                                        strokeDasharray="0" 
                                        vertical={false} 
                                        stroke="#f3f4f6" 
                                    />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        domain={[0, 100]}
                                        ticks={[0, 20, 40, 60, 80,100]}
                                    />
                                    <Tooltip 
                                        content={<CustomTooltip />}
                                        cursor={{
                                            stroke: '#cbd5e1',
                                            strokeWidth: 1,
                                            strokeDasharray: '4 4'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        name="w1"
                                        dataKey="w1"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorW1)"
                                        style={{ filter: 'url(#glowRed)' }}
                                        activeDot={{
                                            r: 5,
                                            fill: '#fff',
                                            stroke: '#f97316',
                                            strokeWidth: 2
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        name="w2"
                                        dataKey="w2"
                                        stroke="#2181dbff"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorW2)"
                                        style={{ filter: 'url(#glowOrange)' }}
                                        activeDot={{
                                            r: 5,
                                            fill: '#fff',
                                            stroke: '#2181dbff',
                                            strokeWidth: 2
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Breakdown Donut Chart */}
                <Card className="border-neutral-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-neutral-900">Inventory Breakdown</CardTitle>
                        <CardDescription className="text-neutral-500">
                            Distribution across all categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 pb-6">
                        {/* Donut chart */}
                        <div className="relative">
                            <ResponsiveContainer width={220} height={220}>
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={68}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Centre label */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-neutral-900">
                                    {donutTotal.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mt-0.5">
                                    Total Items
                                </span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 w-full px-2">
                            {donutData.map((d) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: d.color }}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-medium text-neutral-500 truncate">{d.name}</p>
                                        <p className="text-sm font-bold text-neutral-900">{d.value.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-neutral-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle className="text-neutral-900 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neutral-400" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription className="text-neutral-500 mt-1">Latest inventory changes across all modules</CardDescription>
                    </div>
                    
                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                        View All History
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-neutral-50 transition-colors">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-neutral-900">{item.action}</p>
                                    <p className="text-xs text-neutral-500 truncate">{item.detail}</p>
                                </div>
                                <span className="text-xs text-neutral-400 shrink-0 font-medium">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* View All History Dialog (Big Card in Center) */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="sm:max-w-[700px] text-black w-[90vw] overflow-hidden rounded-[24px] p-0 border border-neutral-200/60 shadow-2xl bg-white mx-auto">
                    <DialogHeader className="px-6 md:px-8 py-6 border-b border-neutral-100 bg-neutral-50/50">
                        <DialogTitle className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2.5">
                            <Clock className="h-6 w-6 text-neutral-400" />
                            Activity History
                        </DialogTitle>
                        <p className="text-sm text-neutral-500 mt-1">
                            A complete log of recent changes across the inventory system.
                        </p>
                    </DialogHeader>
                    
                    <div className="px-3 md:px-5 py-4 max-h-[65vh] overflow-y-auto bg-white">
                        <div className="space-y-1.5">
                            {recentActivity.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-transparent hover:border-neutral-100 hover:bg-neutral-50 transition-colors">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-neutral-900 mb-0.5">{item.action}</p>
                                        <p className="text-sm text-neutral-500 truncate">{item.detail}</p>
                                    </div>
                                    <span className="text-sm text-neutral-400 shrink-0 font-medium whitespace-nowrap ml-4 bg-neutral-100/50 px-2.5 py-1 rounded-full">{item.time}</span>
                                </div>
                            ))}

                            {/* Dummy items for scrolling context */}
                            <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-transparent hover:border-neutral-100 hover:bg-neutral-50 transition-colors opacity-70">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold text-neutral-900 mb-0.5">Stock Updated</p>
                                    <p className="text-sm text-neutral-500 truncate">RG316 Bulk Head: 20 → 40 pcs</p>
                                </div>
                                <span className="text-sm text-neutral-400 shrink-0 font-medium whitespace-nowrap ml-4 bg-neutral-100/50 px-2.5 py-1 rounded-full">3 days ago</span>
                            </div>

                            <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-transparent hover:border-neutral-100 hover:bg-neutral-50 transition-colors opacity-70">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                    <Radio className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold text-neutral-900 mb-0.5">Gateway Registered</p>
                                    <p className="text-sm text-neutral-500 truncate">Gateway 915 Indoor — Genis</p>
                                </div>
                                <span className="text-sm text-neutral-400 shrink-0 font-medium whitespace-nowrap ml-4 bg-neutral-100/50 px-2.5 py-1 rounded-full">Last week</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Critical Alerts Dialog */}
            <Dialog open={isCriticalAlertsOpen} onOpenChange={setIsCriticalAlertsOpen}>
                <DialogContent className="sm:max-w-[800px] text-black w-[90vw] overflow-hidden rounded-[24px] p-0 border border-neutral-200/60 shadow-2xl bg-white mx-auto">
                    <DialogHeader className="px-6 md:px-8 py-6 border-b border-neutral-100 bg-red-50/50">
                        <DialogTitle className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2.5">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            Critical Alerts
                        </DialogTitle>
                        <p className="text-sm text-neutral-500 mt-1">
                            Components with extremely low stock that require immediate attention.
                        </p>
                    </DialogHeader>
                    
                    <div className="px-3 md:px-5 py-4 max-h-[65vh] overflow-y-auto bg-white">
                        <div className="space-y-3">
                            {criticalComponents.map((comp) => (
                                <div
                                    key={comp.sku}
                                    className="flex items-center justify-between rounded-xl border border-red-100/50 bg-red-50/20 p-4 transition-all hover:bg-red-50/40 hover:border-red-200 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100/60">
                                            <Cpu className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900">{comp.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 rounded">{comp.sku}</span>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
                                                    {comp.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="hidden text-right sm:block">
                                            <p className="text-xs text-neutral-500">
                                                Stock: <span className="font-bold text-red-600">{comp.stock} pcs</span>
                                                <span className="text-neutral-400 ml-1">/ {comp.min} min</span>
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs border-neutral-200 bg-white shadow-sm text-neutral-600 hidden md:inline-flex"
                                        >
                                            {comp.warehouse}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 border-transparent shadow-sm"
                                        >
                                            Critical
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
