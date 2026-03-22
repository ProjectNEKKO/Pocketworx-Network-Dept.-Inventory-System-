"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout, getRole } from "@/lib/auth";
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
    Users,
    UserCircle,
} from "lucide-react";

const navItems = [
    { label: "Dashboard",        href: "/",          icon: LayoutDashboard },
    { label: "Gateways",         href: "/gateways",  icon: Radio },
    { label: "Components",       href: "/components",icon: Cpu },
    { label: "Bill of Materials", href: "/bom",      icon: FileStack },
    { label: "Warehouse",        href: "/warehouse", icon: Warehouse },
    { label: "User Management",  href: "/users",     icon: Users, adminOnly: true },
    { label: "User Profile",     href: "/profile",   icon: UserCircle },
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
    const role = getRole();
    const visibleItems = navItems.filter(item => !item.adminOnly || role === "admin");

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside
            className={cn(
                "flex h-screen flex-col border-r border-neutral-200 bg-white transition-all duration-300",
                collapsed ? "w-[68px]" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className="flex h-16 items-center gap-3 px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="PWX Logo" className="h-full w-full object-contain" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-bold tracking-tight text-neutral-900">
                            PWX Inventory
                        </span>
                        <span className="truncate text-[11px] text-neutral-500">
                            Management System
                        </span>
                    </div>
                )}
            </div>

            <Separator className="bg-neutral-200" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {visibleItems.map((item) => {
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
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-[18px] w-[18px] shrink-0 transition-colors",
                                    isActive
                                        ? "text-blue-600"
                                        : "text-neutral-500 group-hover:text-neutral-700"
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

            <Separator className="bg-neutral-200" />

            {/* Bottom section */}
            <div className="space-y-2 p-3">
                {/* Collapse toggle */}
                {onToggleCollapse && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleCollapse}
                        className={cn(
                            "w-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
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
                                className="w-full justify-center px-0 text-neutral-500 hover:bg-red-50 hover:text-red-600"
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
                        className="w-full justify-start text-neutral-500 hover:bg-red-50 hover:text-red-600"
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
    const role = getRole();
    const visibleItems = navItems.filter(item => !item.adminOnly || role === "admin");

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="PWX Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                    <p className="text-sm font-bold text-neutral-900">PWX Inventory</p>
                    <p className="text-[11px] text-neutral-500">Management System</p>
                </div>
            </div>

            <Separator className="bg-neutral-200" />

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {visibleItems.map((item) => {
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
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-[18px] w-[18px]",
                                    isActive ? "text-blue-600" : "text-neutral-500"
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="bg-neutral-200" />

            <div className="p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-neutral-500 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
