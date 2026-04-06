"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    Download,
    Search,
    CheckCircle,
} from "lucide-react";
import { DashboardSummary } from "@/lib/db";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    StockRequest,
    loadRequests,
    updateRequestStatus,
} from "@/lib/stock-requests";
import { downloadExcelTemplate, processExcelImport, ImportResult } from "@/lib/excel-import";
import { toast } from "sonner";
import { ComponentItem } from "../components/add_components";
import { GatewayItem } from "../gateways/add_gateways";
function formatActivityDate(iso: string) {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    
    if (diff > threeDays) {
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options).replace(/ at |, /g, ' - ').replace('--', '-');
    }
    
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} mins ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hrs ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "Yesterday";
    return `${d} days ago`;
}

function getActivityDisplay(action: string) {
    const act = action.toLowerCase();
    if (act.includes('removed') || act.includes('declined') || act.includes('deleted')) {
        return { icon: AlertTriangle, color: "bg-red-100 text-red-600" };
    }
    if (act.includes('added') || act.includes('created') || act.includes('registered')) {
        if (act.includes('gateway')) return { icon: Radio, color: "bg-blue-100 text-blue-600" };
        return { icon: PackagePlus, color: "bg-violet-100 text-violet-600" };
    }
    if (act.includes('gateway')) {
        return { icon: Radio, color: "bg-blue-100 text-blue-600" };
    }
    return { icon: RefreshCw, color: "bg-amber-100 text-amber-600" };
}

// Stats data moved inside component to access state

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


// recentActivity is now dynamic state in DashboardPage

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            name: string;
            breakdown: Array<{ name: string; detail?: string; value?: string | number }>;
        };
    }>;
}

const DashboardStatTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const items = data.breakdown || [];
        if (items.length === 0) return null;

        return (
            <div className="rounded-xl bg-neutral-900 px-4 py-3 shadow-2xl border border-neutral-800 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                <p className="text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-wider border-b border-neutral-800 pb-1.5">{data.name} Breakdown</p>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-hide text-left">
                    {items.slice(0, 15).map((item, index: number) => (
                        <div key={index} className="flex items-center gap-3 justify-between">
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-bold text-white/90 truncate">{item.name}</span>
                                {item.detail && <span className="text-[9px] text-neutral-500 truncate leading-none mt-0.5">{item.detail}</span>}
                            </div>
                            <span className="text-[10px] font-extrabold text-amber-400 shrink-0 ml-2">
                                {item.value || ""}
                            </span>
                        </div>
                    ))}
                    {items.length > 15 && (
                        <p className="text-[9px] text-neutral-500 pt-1 text-center italic border-t border-neutral-800 mt-1">
                            + {items.length - 15} more items
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

interface AreaTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: AreaTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="relative mb-2">
                <div className="rounded-xl bg-neutral-900 px-4 py-2 shadow-2xl border border-neutral-800">
                    <p className="text-[10px] font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">{label}</p>
                    <div className="space-y-1.5">
                        {[...payload].sort((a, b) => b.value - a.value).map((entry, index: number) => (
                            <div key={index} className="flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-[11px] font-medium text-white/90">
                                        {entry.name === "w1" ? "PWX IoT Hub" : "Jenny&apos;s"}
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
    const [historySearch, setHistorySearch] = useState("");
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<{
        id: number;
        icon: any;
        color: string;
        action: string;
        detail: string;
        time: string;
        user: string;
        rawItemSku: string | null;
        itemHistory: Array<{ action: string; detail: string; time: string; user: string }>;
    } | null>(null);
    const [isCriticalAlertsOpen, setIsCriticalAlertsOpen] = useState(false);
    const [importPreview, setImportPreview] = useState<ImportResult | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [stats, setStats] = useState<DashboardSummary | null>(null);
    const [period, setPeriod] = useState<keyof typeof chartData>("Today");
    const [activityLogs, setActivityLogs] = useState<any[]>([]);

    const gatewayColors = ["#3b82f6", "#60a5fa", "#93c5fd"];
    const componentColors = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
    const alertColors = ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3"];

    const statsData = [
        {
            label: "Registered Gateways",
            value: stats?.gateways?.total.toString() || "0",
            icon: Radio,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-100/80",
            href: "/gateways",
            data: (stats?.gateways?.categories || []).map((cat, i) => ({
                name: cat.name,
                value: cat.count,
                color: gatewayColors[i % gatewayColors.length],
                breakdown: cat.items.map(g => ({ name: g.name, detail: g.location }))
            })) || [{ name: "Gateways", value: 0, color: "#3b82f6", breakdown: [] }]
        },
        {
            label: "Components",
            value: stats?.components?.total.toString() || "0",
            icon: Cpu,
            iconColor: "text-violet-500",
            bgColor: "bg-violet-100/80",
            href: "/components",
            data: (stats?.components?.categories || []).slice(0, 5).map((cat, i) => ({
                name: cat.name,
                value: cat.count,
                color: componentColors[i % componentColors.length],
                breakdown: cat.items.slice(0, 20).map(c => ({ name: c.name, detail: c.sku, value: c.stock }))
            })) || [{ name: "Components", value: 0, color: "#8b5cf6", breakdown: [] }]
        },
        {
            label: "Total BOMs",
            value: "5",
            icon: FileStack,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-100/80",
            href: "/bom",
            data: [
                { name: "Active", value: 3, color: "#f59e0b", breakdown: [{ name: "Active BOMs", value: 3 }] },
                { name: "Draft", value: 2, color: "#fde68a", breakdown: [{ name: "Draft BOMs", value: 2 }] },
            ]
        },
        {
            label: "Critical Alerts",
            value: stats?.alerts?.total.toString() || "0",
            icon: AlertTriangle,
            iconColor: "text-red-500",
            bgColor: "bg-red-100/80",
            data: (stats?.alerts?.categories || []).map((cat, i) => ({
                name: cat.name,
                value: cat.count,
                color: alertColors[i % alertColors.length],
                breakdown: cat.items.map(a => ({ 
                    name: a.name, 
                    detail: `${a.stock}/${a.min_stock} - ${a.warehouse}`,
                    value: `${a.stock} left`
                }))
            })) || [{ name: "Critical", value: 0, color: "#ef4444", breakdown: [] }]
        },
    ];

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/dashboard/stats");
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        }
        fetchStats();

        async function fetchLogs() {
            try {
                const res = await fetch("/api/activity");
                if (res.ok) {
                    const data = await res.json();
                    setActivityLogs(data);
                }
            } catch (err) {
                console.error("Failed fetching activity logs", err);
            }
        }
        fetchLogs();

        const sse = new EventSource("/api/activity/stream");
        sse.addEventListener("activity_update", (e) => {
            try {
                const newLog = JSON.parse(e.data);
                setActivityLogs((prev) => [newLog, ...prev]);
            } catch (err) {
                console.error("Failed parsing activity stream", err);
            }
        });

        return () => {
            sse.close();
        };
    }, []);

    // Map dynamic logs to expected UI payload
    const mappedLogs = activityLogs.map(log => {
        const display = getActivityDisplay(log.action || "");
        return {
            id: log.id,
            icon: display.icon,
            color: display.color,
            action: log.action || "Unknown Action",
            detail: log.detail || "",
            time: formatActivityDate(log.created_at),
            user: log.user_name || log.user_email || "System",
            rawItemSku: log.item_sku,
            itemHistory: activityLogs
                .filter(l => l.item_sku && l.item_sku === log.item_sku)
                .map(l => ({
                    action: l.action || "Unknown Action",
                    detail: l.detail || "",
                    time: formatActivityDate(l.created_at),
                    user: l.user_name || l.user_email || "System"
                }))
        };
    });

    const filteredHistory = mappedLogs.filter(item =>
        (item.action || "").toLowerCase().includes(historySearch.toLowerCase()) ||
        (item.detail || "").toLowerCase().includes(historySearch.toLowerCase()) ||
        (item.user || "").toLowerCase().includes(historySearch.toLowerCase())
    );

    const activeData = chartData[period];
    return (
        <div className="space-y-10 min-h-screen bg-transparent">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-[15px] font-medium text-neutral-500/80">
                        Operational overview of your network inventory
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                    {role === "admin" && (
                        <>
                            <button
                                onClick={downloadExcelTemplate}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 hover:bg-neutral-100 text-neutral-700 h-10 px-4 py-2 cursor-pointer border border-neutral-200 shadow-sm"
                            >
                                <Download className="h-4 w-4 shrink-0" />
                                <span className="hidden sm:inline">Download Template</span>
                            </button>
                            <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 h-10 px-4 py-2 cursor-pointer shadow-sm">
                                <Upload className="h-4 w-4 shrink-0" />
                                <span className="hidden sm:inline">Import Excel</span>
                                <span className="sm:hidden">Import</span>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const file = e.target.files[0];
                                            setIsImporting(true);
                                            try {
                                                const [cRes, gRes] = await Promise.all([
                                                    fetch("/api/inventory/components"),
                                                    fetch("/api/inventory/gateways")
                                                ]);
                                                const currentComponents = await cRes.json();
                                                const currentGateways = await gRes.json();

                                                const result = await processExcelImport(file, currentComponents, currentGateways);

                                                if (result.success) {
                                                    if (
                                                        result.components.added.length > 0 ||
                                                        result.components.updated.length > 0 ||
                                                        result.gateways.added.length > 0 ||
                                                        result.gateways.updated.length > 0
                                                    ) {
                                                        setImportPreview(result);
                                                    } else {
                                                        toast.info("No changes found.", { description: "The Excel file data matches current inventory." });
                                                    }
                                                } else {
                                                    toast.error("Import Failed", { description: result.error });
                                                }
                                            } catch (err) {
                                                toast.error("Error loading inventory for import comparison.");
                                            } finally {
                                                setIsImporting(false);
                                                e.target.value = "";
                                            }
                                        }
                                    }}
                                />
                            </label>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statsData.map((stat) => {
                    const CardComponent = (
                        <Card className="rounded-[22px] border-neutral-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out hover:border-neutral-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] cursor-pointer hover:-translate-y-1 h-full flex flex-col py-3">
                            <CardContent className="p-3.5 flex flex-col h-full space-y-3">
                                {/* Header: Title and total */}
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.1em]">{stat.label}</p>
                                        <span className="text-2xl font-bold tracking-tighter text-neutral-900 leading-none">{stat.value}</span>
                                    </div>
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${stat.bgColor?.replace('/80', '/10') || 'bg-neutral-50'}`}>
                                        <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor || 'text-neutral-500'}`} />
                                    </div>
                                </div>

                                {/* Chart + Legend Row */}
                                <div className="flex items-center justify-center gap-5 w-full">
                                    {/* Donut */}
                                    <div className="h-[80px] flex items-center justify-center">
                                        <PieChart width={80} height={80}>
                                            <Pie
                                                data={stat.data}
                                                cx={40}
                                                cy={40}
                                                innerRadius={18}
                                                outerRadius={26}
                                                paddingAngle={3}
                                                dataKey="value"
                                                strokeWidth={0}
                                                isAnimationActive={true}
                                                animationBegin={200}
                                                animationDuration={1500}
                                                animationEasing="ease-out"
                                            >
                                                {stat.data.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} className="focus:outline-none transition-all duration-300 hover:opacity-70" />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                content={<DashboardStatTooltip />} 
                                                cursor={{ fill: 'transparent' }}
                                                position={{ y: -20 }}
                                            />
                                        </PieChart>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className={`border-l border-neutral-100 pl-4 min-w-0 ${stat.data.length > 5 ? "grid grid-cols-2 gap-x-4 gap-y-1" : "flex flex-col justify-center gap-1.5"}`}>
                                        {stat.data.map((d) => (
                                            <div key={d.name} className="flex items-center justify-between gap-4 group cursor-default">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span 
                                                        className="h-2 w-2 rounded-full shrink-0 transition-transform group-hover:scale-125" 
                                                        style={{ backgroundColor: d.color }} 
                                                    />
                                                    <span className="text-[10px] font-bold text-neutral-500/80 group-hover:text-neutral-900 transition-colors truncate leading-tight flex-1">{d.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-neutral-900 shrink-0">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );

                    if (stat.label === "Critical Alerts") {
                        return (
                            <div key={stat.label} onClick={() => setIsCriticalAlertsOpen(true)} className="block w-full h-full text-left outline-none cursor-pointer" role="button" tabIndex={0}>
                                {CardComponent}
                            </div>
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
                                    className={`px-4 py-1.5 text-xs font-medium transition-all duration-300 rounded-full ${period === p
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
                                        ticks={[0, 20, 40, 60, 80, 100]}
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
                        {mappedLogs.slice(0, 8).map((item, i) => (
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <DialogTitle className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2.5">
                                    <Clock className="h-6 w-6 text-neutral-400" />
                                    Activity History
                                </DialogTitle>
                                <p className="text-sm text-neutral-500 mt-1">
                                    A complete log of recent changes across the inventory system.
                                </p>
                            </div>
                            <div className="relative w-full sm:w-64 shrink-0">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    placeholder="Search history..."
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    className="pl-9 bg-white border-neutral-200 h-10 w-full focus-visible:ring-amber-500/20 focus-visible:border-amber-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-3 md:px-5 py-4 max-h-[65vh] overflow-y-auto bg-white">
                        <div className="space-y-1.5">
                            {filteredHistory.length > 0 ? filteredHistory.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedHistoryItem(item)}
                                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-transparent hover:border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer"
                                >
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
                            )) : (
                                <div className="text-center py-10 text-neutral-500">
                                    <Search className="h-8 w-8 mx-auto text-neutral-300 mb-3" />
                                    <p className="text-sm font-medium text-neutral-600">No matching history found.</p>
                                    <p className="text-xs mt-1">Try adjusting your search terms.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Item History Pop-up */}
            <Dialog open={!!selectedHistoryItem} onOpenChange={(open) => !open && setSelectedHistoryItem(null)}>
                <DialogContent className="sm:max-w-[500px] text-black w-[90vw] rounded-[24px] p-0 overflow-hidden border border-neutral-200/60 shadow-2xl bg-white mx-auto">
                    <DialogHeader className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/80">
                        <DialogTitle className="text-xl font-bold text-neutral-900 flex flex-col gap-1">
                            <span>Item History</span>
                            <span className="text-sm font-medium text-neutral-500 truncate mt-0.5">{selectedHistoryItem?.detail}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-6 pb-8">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-5">Last 5 Changes</h4>
                        <div className="space-y-5 pl-1.5 pt-1">
                            {selectedHistoryItem?.itemHistory?.map((log, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {/* Timeline line */}
                                    {i !== selectedHistoryItem.itemHistory.length - 1 && (
                                        <div className="absolute left-[3.5px] top-[22px] bottom-[-24px] w-[2px] bg-neutral-200/70" />
                                    )}
                                    <div className="relative z-10 w-[9px] h-[9px] rounded-full bg-white border-[2.5px] border-amber-500 mt-1.5 shrink-0 shadow-sm" />
                                    <div className="flex-1 pb-2">
                                        <div className="flex justify-between items-start gap-2 mb-1.5">
                                            <span className="text-sm font-bold text-neutral-900 leading-none">{log.action}</span>
                                            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 rounded whitespace-nowrap uppercase tracking-wider leading-none mt-[-2px]">{log.time}</span>
                                        </div>
                                        <p className="text-sm text-neutral-600 mb-1.5 leading-snug">{log.detail}</p>
                                        <div className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
                                            <div className="h-4 w-4 rounded-full bg-neutral-200 flex items-center justify-center text-[8px] font-bold text-neutral-600">{log.user.charAt(0)}</div>
                                            <span>by <span className="text-neutral-600">{log.user}</span></span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!selectedHistoryItem?.itemHistory || selectedHistoryItem.itemHistory.length === 0) && (
                                <div className="text-center py-6">
                                    <p className="text-sm text-neutral-500">No recorded history for this item.</p>
                                </div>
                            )}
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
                            {(stats?.alerts?.categories || []).length > 0 ? (stats?.alerts?.categories || []).map((cat) => (
                                <div key={cat.name} className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1 mt-4 first:mt-0">{cat.name}</h4>
                                    {(cat.items || []).map((comp) => (
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
                                                        <span className="text-neutral-400 ml-1">/ {comp.min_stock} min</span>
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
                            )) : (
                                <div className="text-center py-20">
                                    <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900">All Clear!</h3>
                                    <p className="text-neutral-500 text-sm mt-1">No critical stock alerts at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Import Preview Dialog */}
            <Dialog open={!!importPreview} onOpenChange={(o) => (!o && setImportPreview(null))}>
                <DialogContent className="sm:max-w-[700px] w-[90vw] text-black rounded-[24px] p-0 border border-neutral-200/60 shadow-2xl overflow-hidden bg-white mx-auto flex flex-col max-h-[90vh]">
                    <DialogHeader className="px-6 md:px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
                        <DialogTitle className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2.5">
                            <Upload className="h-6 w-6 text-violet-500" />
                            Review Import Data
                        </DialogTitle>
                        <p className="text-sm text-neutral-500 mt-1">
                            Please review the changes that will be applied to your inventory.
                        </p>
                    </DialogHeader>

                    <div className="px-6 py-4 flex-1 overflow-y-auto">
                        {importPreview?.errors && importPreview.errors.length > 0 && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                                <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Validation Errors ({importPreview.errors.length})</h4>
                                <ul className="list-disc pl-5 space-y-1 text-xs text-red-700">
                                    {importPreview.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                                    {importPreview.errors.length > 10 && <li className="font-semibold mt-1 opacity-70">...and {importPreview.errors.length - 10} more errors.</li>}
                                </ul>
                                <p className="text-xs text-red-600 mt-3 font-medium">Any valid items will still be imported below despite these local row errors.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-[#f8f6fd] border border-[#f3edf9]">
                                <h4 className="text-sm font-bold text-[#4B21A1] mb-3 flex items-center gap-2"><Cpu className="w-4 h-4" /> Components</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[13px] text-neutral-600 font-medium"><span>New Additions:</span> <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded shadow-sm border border-neutral-100 min-w-[28px] text-center">{importPreview?.components.added.length}</span></div>
                                    <div className="flex justify-between items-center text-[13px] text-neutral-600 font-medium"><span>Quantity Updates:</span> <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded shadow-sm border border-neutral-100 min-w-[28px] text-center">{importPreview?.components.updated.length}</span></div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-[#f4faff] border border-[#eef5fd]">
                                <h4 className="text-sm font-bold text-[#1E3A8A] mb-3 flex items-center gap-2"><Radio className="w-4 h-4" /> Gateways</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[13px] text-neutral-600 font-medium"><span>New Additions:</span> <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded shadow-sm border border-neutral-100 min-w-[28px] text-center">{importPreview?.gateways.added.length}</span></div>
                                    <div className="flex justify-between items-center text-[13px] text-neutral-600 font-medium"><span>Quantity Updates:</span> <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded shadow-sm border border-neutral-100 min-w-[28px] text-center">{importPreview?.gateways.updated.length}</span></div>
                                </div>
                            </div>
                        </div>

                        {(importPreview?.components.added.length || 0) > 0 && (
                            <div className="mb-5 bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Sample Component Additions</h4>
                                <div className="text-sm text-neutral-700 space-y-2">
                                    {importPreview?.components.added.slice(0, 3).map((c, i) => (
                                        <div key={i} className="flex justify-between items-center border-b border-neutral-50 pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium">{c.name}</span>
                                            <span className="text-emerald-600 text-[11px] font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{c.sku} (+{c.stock})</span>
                                        </div>
                                    ))}
                                    {(importPreview?.components.added.length || 0) > 3 && <p className="text-xs text-neutral-400 italic mt-2 text-center border-t border-neutral-50 pt-2">+ {importPreview!.components.added.length - 3} more new items</p>}
                                </div>
                            </div>
                        )}
                        {(importPreview?.components.updated.length || 0) > 0 && (
                            <div className="mb-5 bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Sample Component Updates</h4>
                                <div className="text-sm text-neutral-700 space-y-2">
                                    {importPreview?.components.updated.slice(0, 3).map((c, i) => (
                                        <div key={i} className="flex justify-between items-center border-b border-neutral-50 pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium">{c.name}</span>
                                            <span className="text-blue-600 text-[11px] font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{c.sku} (Now: {c.stock})</span>
                                        </div>
                                    ))}
                                    {(importPreview?.components.updated.length || 0) > 3 && <p className="text-xs text-neutral-400 italic mt-2 text-center border-t border-neutral-50 pt-2">+ {importPreview!.components.updated.length - 3} more updated items</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 shrink-0 flex gap-3 justify-end items-center">
                        <Button variant="ghost" className="text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900 font-medium px-5" onClick={() => setImportPreview(null)}>Cancel</Button>
                        <Button disabled={isImporting} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md font-medium px-6" onClick={async () => {
                            if (!importPreview) return;
                            setIsImporting(true);
                            try {
                                const componentAdjustOps = importPreview.components.updated.map(c => fetch("/api/inventory/components/adjust", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ sku: c.sku, warehouse: c.warehouse, delta: c.stock })
                                }));

                                const gatewayOps = [
                                    ...importPreview.gateways.added.map(g => fetch("/api/inventory/gateways", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(g)
                                    })),
                                    ...importPreview.gateways.updated.map(g => fetch("/api/inventory/gateways", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(g) // Gateways still use PATCH for now, but we can make an adjust API for them too if needed
                                    }))
                                ];

                                await Promise.all([
                                    ...importPreview.components.added.map(c => fetch("/api/inventory/components", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(c)
                                    })),
                                    ...componentAdjustOps,
                                    ...gatewayOps
                                ]);

                                const totalAdded = importPreview.components.added.length + importPreview.gateways.added.length;
                                const totalUpdated = importPreview.components.updated.length + importPreview.gateways.updated.length;

                                toast.success(`Import Confirmed!`, {
                                    description: `Successfully added ${totalAdded} items and updated ${totalUpdated} existing items.`,
                                });

                                setImportPreview(null);
                                setTimeout(() => { window.location.reload(); }, 600);
                            } catch (err) {
                                toast.error("Import failed. Some items may not have been saved.");
                            } finally {
                                setIsImporting(false);
                            }
                        }}>{isImporting ? "Processing..." : "Confirm Import"}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
