"use client";

import { useState, useRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as XLSX from "xlsx";
import { Plus, FileUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface WarehouseLocation {
    name: string;
    zone: string;
    bins: number;
    utilization: number;
    status: string;
}

const formSchema = z.object({
    name: z.string().min(1, "Location name is required"),
    zone: z.string().min(1, "Zone is required"),
    bins: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Bins must be a non-negative number"),
    utilization: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Utilization must be between 0 and 100"),
    status: z.string().min(1, "Status is required"),
});

export function AddWarehouseDialog({
    onAdd,
    onImport,
}: {
    onAdd: (location: WarehouseLocation) => void;
    onImport: (locations: WarehouseLocation[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [importedData, setImportedData] = useState<WarehouseLocation[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            zone: "",
            bins: "",
            utilization: "",
            status: "Active",
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const newLocations = jsonData.map((row: any) => ({
                    name: row.name || row.Name || "New Warehouse",
                    zone: row.zone || row.Zone || "Unassigned",
                    bins: parseInt(row.bins || row.Bins || 0) || 0,
                    utilization: parseInt(row.utilization || row.Utilization || 0) || 0,
                    status: row.status || row.Status || "Active",
                }));

                setImportedData(newLocations);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
                alert("Failed to parse Excel file. Please ensure it is a valid format.");
                setFileName(null);
                setImportedData([]);
            }
        };
        reader.readAsArrayBuffer(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveFile = () => {
        setFileName(null);
        setImportedData([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (importedData.length > 0) {
            onImport(importedData);
        } else {
            onAdd({
                name: values.name,
                zone: values.zone,
                bins: Number(values.bins),
                utilization: Number(values.utilization),
                status: values.status,
            });
        }

        form.reset();
        handleRemoveFile();
        setOpen(false);
    }

    function handleOpenChange(newOpen: boolean) {
        if (!newOpen) {
            form.reset();
            handleRemoveFile();
        }
        setOpen(newOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-neutral-950 hover:bg-neutral-800 text-white shadow-md transition-colors">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] text-black">
                <DialogHeader>
                    <DialogTitle>Add New Warehouse Location</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Excel File Upload Area */}
                        <div className="flex flex-col items-center justify-center mb-4">
                            <div
                                className="relative group flex flex-col h-24 w-full items-center justify-center rounded-xl bg-neutral-100/60 border-2 border-dashed border-neutral-300 hover:border-emerald-400 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {fileName ? (
                                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                                        <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                            <FileUp className="h-5 w-5" />
                                            <span>{fileName}</span>
                                        </div>
                                        <span className="text-xs text-neutral-500">
                                            {importedData.length} location(s) ready to import
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile();
                                            }}
                                            className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 rounded-full transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                                        <FileUp className="h-6 w-6 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                                        <span className="text-sm font-medium group-hover:text-emerald-600 transition-colors">Import Excel File (Optional)</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        {!fileName && (
                            <>
                                <div className="text-center text-xs text-neutral-500 font-medium my-2">OR ADD MANUALLY</div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Area 51" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="zone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Zone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Basement" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bins"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Bins</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="utilization"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Utilization (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-neutral-950 hover:bg-neutral-800 text-white transition-colors"
                            >
                                {fileName ? "Import" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
