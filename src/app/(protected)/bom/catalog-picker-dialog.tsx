"use client";

import { useMemo, useState } from "react";
import type { ComponentItem } from "@/app/(protected)/components/add_components";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function CatalogPickerDialog({
    open,
    onOpenChange,
    catalog,
    onPick,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog: ComponentItem[];
    onPick: (item: ComponentItem) => void;
}) {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        let items = catalog;
        if (t) {
            items = items.filter((c) =>
                c.name.toLowerCase().includes(t) ||
                c.sku.toLowerCase().includes(t)
            );
        }
        
        // Deduplicate by sku so we don't render multiple identical items 
        // that just differ by warehouse
        const seen = new Set<string>();
        return items.filter((c) => {
            if (seen.has(c.sku)) return false;
            seen.add(c.sku);
            return true;
        });
    }, [catalog, q]);

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) setQ("");
                onOpenChange(next);
            }}
        >
            <DialogContent className="flex max-h-[min(80vh,520px)] flex-col gap-0 p-0 text-black sm:max-w-md">
                <DialogHeader className="shrink-0 border-b border-neutral-100 p-4 pb-3">
                    <DialogTitle>Pick from Catalog</DialogTitle>
                    <p className="text-left text-xs font-normal text-neutral-500">
                        Inventory components (Components page). You can still
                        type ad-hoc part numbers in the grid.
                    </p>
                </DialogHeader>
                <div className="shrink-0 px-4 pt-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            className="border-neutral-200 pl-9"
                            placeholder="Search by name or SKU..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                    {filtered.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-neutral-400">
                            No matches. Add parts on the Components page.
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {filtered.map((c) => (
                                <li key={c.sku}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-auto w-full justify-start whitespace-normal px-3 py-2.5 text-left font-normal"
                                        onClick={() => {
                                            onPick(c);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <span className="block">
                                            <span className="text-sm font-medium text-neutral-900">
                                                {c.name}
                                            </span>
                                            <span className="mt-0.5 block font-mono text-xs text-neutral-500">
                                                {c.sku}
                                            </span>
                                        </span>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
