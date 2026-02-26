"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Package,
    LayoutDashboard,
    Radio,
    Cpu,
    FileStack,
    Warehouse,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const navItems = [
    {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Gateways",
        href: "/gateways",
        icon: Radio,
    },
    {
        label: "Components",
        href: "/components",
        icon: Cpu,
    },
    {
        label: "Bill of Materials",
        href: "/bom",
        icon: FileStack,
    },
    {
        label: "Warehouse",
        href: "/warehouse",
        icon: Warehouse,
    },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function Sidebar({
    collapsed = false,
    onToggleCollapse,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside
            className={cn(
                "flex h-screen flex-col border-r border-white/10 bg-neutral-900/95 backdrop-blur-xl transition-all duration-300",
                collapsed ? "w-[68px]" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className="flex h-16 items-center gap-3 px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
                    <Package className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-bold tracking-tight text-white">
                            PWX Inventory
                        </span>
                        <span className="truncate text-[11px] text-neutral-500">
                            Management System
                        </span>
                    </div>
                )}
            </div>

            <Separator className="bg-white/5" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    const linkContent = (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/5"
                                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-[18px] w-[18px] shrink-0 transition-colors",
                                    isActive
                                        ? "text-blue-400"
                                        : "text-neutral-500 group-hover:text-neutral-300"
                                )}
                            />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );

                    if (collapsed) {
                        return (
                            <Tooltip key={item.href} delayDuration={0}>
                                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return linkContent;
                })}
            </nav>

            <Separator className="bg-white/5" />

            {/* Bottom section */}
            <div className="space-y-2 p-3">
                {/* Collapse toggle */}
                {onToggleCollapse && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleCollapse}
                        className={cn(
                            "w-full text-neutral-500 hover:bg-white/5 hover:text-neutral-300",
                            collapsed && "justify-center px-0"
                        )}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Collapse
                            </>
                        )}
                    </Button>
                )}

                {/* Logout */}
                {collapsed ? (
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="w-full justify-center px-0 text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                            Sign Out
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                )}
            </div>
        </aside>
    );
}

/* Mobile-friendly sidebar content (used inside Sheet) */
export function MobileSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
                    <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">PWX Inventory</p>
                    <p className="text-[11px] text-neutral-500">Management System</p>
                </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-[18px] w-[18px]",
                                    isActive ? "text-blue-400" : "text-neutral-500"
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="bg-white/5" />

            <div className="p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
