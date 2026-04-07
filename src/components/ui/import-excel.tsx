"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, AlertTriangle, Cpu, Radio } from "lucide-react";
import { processExcelImport, ImportResult } from "@/lib/excel-import";
import { toast } from "sonner";

interface ImportExcelButtonProps {
    onImportComplete: () => void;
}

export function ImportExcelButton({ onImportComplete }: ImportExcelButtonProps) {
    const [importPreview, setImportPreview] = useState<ImportResult | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    return (
        <>
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
                                        result.gateways.updated.length > 0 ||
                                        result.errors.length > 0
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
                                            <span className="text-blue-600 text-[11px] font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{c.sku} (+{c.stock})</span>
                                        </div>
                                    ))}
                                    {(importPreview?.components.updated.length || 0) > 3 && <p className="text-xs text-neutral-400 italic mt-2 text-center border-t border-neutral-50 pt-2">+ {importPreview!.components.updated.length - 3} more updated items</p>}
                                </div>
                            </div>
                        )}
                        {(importPreview?.gateways.added.length || 0) > 0 && (
                            <div className="mb-5 bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Sample Gateway Additions</h4>
                                <div className="text-sm text-neutral-700 space-y-2">
                                    {importPreview?.gateways.added.slice(0, 3).map((g, i) => (
                                        <div key={i} className="flex justify-between items-center border-b border-neutral-50 pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium">{g.name}</span>
                                            <span className="text-emerald-600 text-[11px] font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{g.sku} (+{g.quantity})</span>
                                        </div>
                                    ))}
                                    {(importPreview?.gateways.added.length || 0) > 3 && <p className="text-xs text-neutral-400 italic mt-2 text-center border-t border-neutral-50 pt-2">+ {importPreview!.gateways.added.length - 3} more new items</p>}
                                </div>
                            </div>
                        )}
                        {(importPreview?.gateways.updated.length || 0) > 0 && (
                            <div className="mb-5 bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Sample Gateway Updates</h4>
                                <div className="text-sm text-neutral-700 space-y-2">
                                    {importPreview?.gateways.updated.slice(0, 3).map((g, i) => (
                                        <div key={i} className="flex justify-between items-center border-b border-neutral-50 pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium">{g.name}</span>
                                            <span className="text-blue-600 text-[11px] font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{g.sku} (+{g.quantity})</span>
                                        </div>
                                    ))}
                                    {(importPreview?.gateways.updated.length || 0) > 3 && <p className="text-xs text-neutral-400 italic mt-2 text-center border-t border-neutral-50 pt-2">+ {importPreview!.gateways.updated.length - 3} more updated items</p>}
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
                                const handleRes = async (res: Response, itemContext: string) => {
                                    if (!res.ok) {
                                        let errText = await res.text();
                                        throw new Error(`Failed to save ${itemContext}. Status: ${res.status}, Details: ${errText}`);
                                    }
                                    return res;
                                };

                                const componentAdjustOps = importPreview.components.updated.map(c => 
                                    fetch("/api/inventory/components/adjust", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ sku: c.sku, warehouse: c.warehouse, delta: c.stock })
                                    }).then(r => handleRes(r, `Adjust Component ${c.sku}`))
                                );

                                const gatewayOps = [
                                    ...importPreview.gateways.added.map(g => 
                                        fetch("/api/inventory/gateways", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(g)
                                        }).then(r => handleRes(r, `Add Gateway ${g.sku}`))
                                    ),
                                    ...importPreview.gateways.updated.map(g => 
                                        fetch("/api/inventory/gateways/adjust", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ sku: g.sku, delta: g.quantity })
                                        }).then(r => handleRes(r, `Adjust Gateway ${g.sku}`))
                                    )
                                ];

                                await Promise.all([
                                    ...importPreview.components.added.map(c => 
                                        fetch("/api/inventory/components", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(c)
                                        }).then(r => handleRes(r, `Add Component ${c.sku}`))
                                    ),
                                    ...componentAdjustOps,
                                    ...gatewayOps
                                ]);

                                const totalAdded = importPreview.components.added.length + importPreview.gateways.added.length;
                                const totalUpdated = importPreview.components.updated.length + importPreview.gateways.updated.length;

                                toast.success(`Import Confirmed!`, {
                                    description: `Successfully added ${totalAdded} items and updated ${totalUpdated} existing items.`,
                                });

                                setImportPreview(null);
                                onImportComplete();
                            } catch (err: any) {
                                console.error("Import error detail:", err.message);
                                toast.error("Import failed.", { description: err.message || "Some items may not have been saved."});
                            } finally {
                                setIsImporting(false);
                            }
                        }}>{isImporting ? "Processing..." : "Confirm Import"}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
