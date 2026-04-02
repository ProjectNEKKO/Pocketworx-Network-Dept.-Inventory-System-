"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { useClientRole } from "@/lib/use-client-role";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    LayoutDashboard,
    Radio,
    Cpu,
    FileStack,
    Archive,
    Warehouse,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Users,
    UserCircle,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Gateways", href: "/gateways", icon: Radio },
    { label: "Components", href: "/components", icon: Cpu },
    { label: "Bill of Materials", href: "/bom", icon: FileStack },
    { label: "Warehouse", href: "/warehouse", icon: Warehouse },
    {
        label: "User Management",
        href: "/users",
        icon: Users,
        adminOnly: true,
    },
    { label: "User Profile", href: "/profile", icon: UserCircle },
] as const;

function isNavItemActive(pathname: string, href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/bom/archived") return pathname.startsWith("/bom/archived");
    if (href === "/bom") {
        return (
            pathname === "/bom" ||
            (pathname.startsWith("/bom/") && !pathname.startsWith("/bom/archived"))
        );
    }
    return pathname.startsWith(href);
}

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
    const { role } = useClientRole();
    const visibleItems = navItems.filter(
        (item) => !("adminOnly" in item && item.adminOnly) || role === "admin"
    );

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
            <Link 
                href="/dashboard" 
                className="flex h-16 items-center gap-3 px-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
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
            </Link>

            <Separator className="bg-neutral-200" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {visibleItems.map((item) => {
                    const isActive = isNavItemActive(pathname, item.href);

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

export function MobileSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { role } = useClientRole();
    const visibleItems = navItems.filter(
        (item) => !("adminOnly" in item && item.adminOnly) || role === "admin"
    );

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex h-full flex-col">
            <Link 
                href="/dashboard"
                className="flex h-16 items-center gap-3 px-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="PWX Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                    <p className="text-sm font-bold text-neutral-900">PWX Inventory</p>
                    <p className="text-[11px] text-neutral-500">Management System</p>
                </div>
            </Link>

            <Separator className="bg-neutral-200" />

            <nav className="flex-1 space-y-1 px-3 py-4">
                {visibleItems.map((item) => {
                    const isActive = isNavItemActive(pathname, item.href);

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