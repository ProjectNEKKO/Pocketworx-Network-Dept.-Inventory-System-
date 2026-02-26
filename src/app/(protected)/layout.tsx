"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
        } else {
            setChecking(false);
        }
    }, [router]);

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-screen bg-neutral-950">
                {/* Desktop sidebar */}
                <div className="hidden md:block">
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
                    />
                </div>

                {/* Mobile top bar + sheet sidebar */}
                <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-white/10 bg-neutral-900/95 px-4 backdrop-blur-xl md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-neutral-400 hover:text-white"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="w-64 border-white/10 bg-neutral-900 p-0"
                        >
                            <MobileSidebar />
                        </SheetContent>
                    </Sheet>
                    <span className="ml-3 text-sm font-semibold text-white">
                        PWX Inventory
                    </span>
                </div>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
                    <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
                </main>
            </div>
        </TooltipProvider>
    );
}
