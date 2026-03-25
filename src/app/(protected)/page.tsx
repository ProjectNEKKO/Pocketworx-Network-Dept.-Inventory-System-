"use client";

import { useState } from "react";
import Link from "next/link";
import { useClientRole } from "@/lib/use-client-role";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    Upload,
    Bell,
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

const statsData = [
    {
        label: "Registered Gateways",
        value: "10",
        icon: Radio,
        href: "/gateways",
        data: [
            { name: "PWX IoT Hub", value: 6, color: "#3b82f6" },
            { name: "Jenny's", value: 4, color: "#93c5fd" },
        ]
    },
    {
        label: "Components",
        value: "40",
        icon: Cpu,
        href: "/components",
        data: [
            { name: "Hardware", value: 15, color: "#8b5cf6" },
            { name: "Networking", value: 10, color: "#c4b5fd" },
            { name: "Enclosure", value: 10, color: "#a78bfa" },
            { name: "Accessories", value: 5, color: "#ede9fe" },
        ]
    },
    {
        label: "Total BOMs",
        value: "5",
        icon: FileStack,
        href: "/bom",
        data: [
            { name: "Active", value: 3, color: "#f59e0b" },
            { name: "Draft", value: 2, color: "#fde68a" },
        ]
    },
    {
        label: "Critical Alerts",
        value: "6",
        icon: AlertTriangle,
        data: [
            { name: "Hardware", value: 2, color: "#ef4444" },
            { name: "Accessories", value: 2, color: "#fca5a5" },
            { name: "Enclosure", value: 1, color: "#f87171" },
            { name: "Networking", value: 1, color: "#fee2e2" },
        ]
    },
];

const criticalComponents = [
    { name: "Enclosure Dimension 168X149 mm", sku: "DIM-168-149", stock: 10, min: 50, warehouse: "PWX IoT Hub", category: "Enclosure", status: "Critical" },
    { name: "2 hole C Clamp 1-1/2' RGD", sku: "HW-CCLAMP-15", stock: 5, min: 100, warehouse: "PWX IoT Hub", category: "Accessories", status: "Critical" },
    { name: "Outlet 4- Gang (For Extension)", sku: "ELEC-OUT-4G", stock: 8, min: 100, warehouse: "Jenny's", category: "Accessories", status: "Critical" },
    { name: "Tofu Heatsink (White)", sku: "HS-TOFU-WHT", stock: 2, min: 100, warehouse: "PWX IoT Hub", category: "Hardware", status: "Critical" },
    { name: "M5 Bolts and Nuts", sku: "HW-M5-BN", stock: 10, min: 300, warehouse: "Jenny's", category: "Hardware", status: "Critical" },
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


const notificationsList = [
    { id: 1, title: "Low Stock Alert", desc: "DIM-168-149 is running critically low (10 left).", time: "10m ago", unread: true },
    { id: 2, title: "New Gateway", desc: "Gateway 915 Outdoor has been registered.", time: "1h ago", unread: true },
    { id: 3, title: "BOM Approved", desc: "PWX Gateway v3.3 Rev A was approved.", time: "2h ago", unread: false },
    { id: 4, title: "Location Added", desc: "PWX IoT Hub — Zone B was added.", time: "1d ago", unread: false },
];


const recentActivity = [
    { icon: PackagePlus, color: "bg-violet-100 text-violet-600",  action: "Component Added",      detail: "915Mhz Lora Antenna 3.8dBi × 10",          time: "2 min ago", user: "John Doe" },
    { icon: Radio,       color: "bg-blue-100 text-blue-600",      action: "Gateway Registered",   detail: "Gateway 915 Outdoor — PWX IoT Hub",       time: "18 min ago", user: "Admin Setup" },
    { icon: RefreshCw,   color: "bg-amber-100 text-amber-600",    action: "Stock Updated",        detail: "CAT5e Cable: 120 → 145 pcs",              time: "1 hr ago", user: "Jane Smith" },
    { icon: FileStack,   color: "bg-orange-100 text-orange-600",  action: "BOM Created",          detail: "PWX Gateway v3.3 — Rev A",               time: "3 hrs ago", user: "Admin Setup" },
    { icon: PackagePlus, color: "bg-violet-100 text-violet-600",  action: "Component Added",      detail: "M5 Bolts and Nuts × 200",                time: "5 hrs ago", user: "John Doe" },
    { icon: RefreshCw,   color: "bg-emerald-100 text-emerald-600",action: "Stock Updated",        detail: "PoE Adaptor 24v: 40 → 55 pcs",           time: "Yesterday", user: "Jane Smith" },
    { icon: Radio,       color: "bg-blue-100 text-blue-600",      action: "Gateway Registered",   detail: "Femto Outdoor — Jenny's",                  time: "Yesterday", user: "Admin Setup" },
    { icon: PlusCircle,  color: "bg-emerald-100 text-emerald-600",action: "Location Added",       detail: "PWX IoT Hub — Zone B (12 bins)",         time: "2 days ago", user: "John Doe" },
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
                                        {entry.name === "w1" ? "PWX IoT Hub" : "Jenny's"}
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
    const { role } = useClientRole();
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isCriticalAlertsOpen, setIsCriticalAlertsOpen] = useState(false);
    const [period, setPeriod] = useState<keyof typeof chartData>("This Year");

    const activeData = chartData[period];
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-neutral-500">
                        Overview of your inventory system
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors outline-none cursor-pointer select-none">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[320px] p-2 bg-white rounded-xl shadow-xl border-neutral-100 z-50">
                            <div className="flex items-center justify-between px-2 py-1.5">
                                <DropdownMenuLabel className="font-semibold text-neutral-900 text-base p-0">Notifications</DropdownMenuLabel>
                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md cursor-pointer hover:bg-amber-100">Mark all read</span>
                            </div>
                            <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                            <div className="max-h-[300px] overflow-y-auto space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
                                {notificationsList.map(n => (
                                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer outline-none rounded-lg transition-colors hover:bg-neutral-50 focus:bg-neutral-50">
                                        <div className="flex items-center justify-between w-full">
                                            <span className={`text-sm font-semibold flex items-center gap-1.5 ${n.unread ? 'text-neutral-900' : 'text-neutral-600'}`}>
                                                {n.unread && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />}
                                                {n.title}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 font-medium shrink-0">{n.time}</span>
                                        </div>
                                        <span className="text-xs text-neutral-500 leading-tight block w-full truncate">{n.desc}</span>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {role === "admin" && (
                        <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 h-10 px-4 py-2 cursor-pointer shadow-sm">
                            <Upload className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">Import Excel</span>
                            <span className="sm:hidden">Import</span>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        console.log("Excel file selected:", e.target.files[0].name);
                                        // Reset value to allow selecting the same file again
                                        e.target.value = "";
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statsData.map((stat) => {
                    const CardComponent = (
                        <Card className="border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 hover:shadow-md cursor-pointer hover:-translate-y-0.5 h-full flex flex-col overflow-hidden">
                            <CardContent className="p-4 flex flex-col h-full">
                                {/* Header: Title and total */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <span className="text-2xl font-extrabold text-neutral-900 leading-none">{stat.value}</span>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100/80 shrink-0">
                                        <stat.icon className="h-4 w-4 text-neutral-500" />
                                    </div>
                                </div>

                                {/* Chart + Legend Row */}
                                <div className="flex items-center gap-4 mt-auto">
                                    {/* Donut */}
                                    <div className="relative h-[70px] w-[70px] shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stat.data}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={24}
                                                    outerRadius={35}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    strokeWidth={0}
                                                >
                                                    {stat.data.map((entry, index) => (
                                                        <Cell key={index} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0 py-1 border-l border-neutral-100 pl-4">
                                        {stat.data.map((d) => (
                                            <div key={d.name} className="flex items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span 
                                                        className="h-1.5 w-1.5 rounded-full shrink-0" 
                                                        style={{ backgroundColor: d.color }} 
                                                    />
                                                    <span className="text-[10px] font-medium text-neutral-500 truncate leading-tight">{d.name}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-neutral-900 shrink-0">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
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
                        <Link key={stat.label} href={stat.href!} className="block w-full h-full outline-none">
                            {CardComponent}
                        </Link>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-1">
                {/* Gateway Components Analytics */}
                <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 px-6 pt-6">
                        <div>
                            <CardTitle className="text-xl font-bold text-neutral-900">Gateway Location</CardTitle>
                            <CardDescription className="text-neutral-500 mt-1">PWX IoT Hub and Jenny's</CardDescription>
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
                                    <p className="text-xs text-neutral-500 truncate mt-0.5"><span className="font-semibold text-neutral-700">{item.user}</span> &bull; {item.detail}</p>
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
                                        <p className="text-base font-semibold text-neutral-900 mb-1">{item.action}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md shrink-0 uppercase tracking-wide">{item.user}</span>
                                            <p className="text-sm text-neutral-500 truncate">{item.detail}</p>
                                        </div>
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
                                    <p className="text-sm text-neutral-500 truncate">Gateway 915 Indoor — Jenny's</p>
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
