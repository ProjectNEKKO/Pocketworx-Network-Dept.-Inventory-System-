"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Upload, X, Package, ShieldAlert } from "lucide-react";
import { useClientRole } from "@/lib/use-client-role";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ComponentActivity {
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface ComponentItem {
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  category: string;
  image?: string;
  warehouse?: string;
  tag?: string;
  history?: ComponentActivity[];
}

const formSchema = z.object({
  name: z.string().min(1, "Component name is required"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Stock must be a non-negative number"),
  min_stock: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Minimum stock must be a non-negative number"),
  category: z.string().min(1, "Category is required"),
  warehouse: z.string().min(1, "Warehouse is required"),
  tag: z.string().min(1, "Origin tag is required"),
});

export function AddComponentsDialog({
  onAdd,
  existingSkus,
}: {
  onAdd: (component: ComponentItem) => void;
  existingSkus: string[];
}) {
  const { role } = useClientRole();
  const isAdmin = role === "admin";
  const [open, setOpen] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      stock: "",
      min_stock: "",
      category: "",
      warehouse: "PWX IoT Hub",
      tag: "Local",
    },
  });

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setImageUrl(url);
      }
  }

  function handleRemoveImage(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      setImageUrl(undefined);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Check for unique SKU
    if (existingSkus.includes(values.sku)) {
      form.setError("sku", { message: "SKU already exists" });
      return;
    }
    
    onAdd({
      name: values.name,
      sku: values.sku,
      stock: Number(values.stock),
      min_stock: Number(values.min_stock),
      category: values.category,
      warehouse: values.warehouse,
      tag: values.tag,
      image: imageUrl,
    });
    
    form.reset();
    setImageUrl(undefined);
    setOpen(false);
  }

  function handleOpenChange(newOpen: boolean) {
      if (!newOpen) {
          form.reset();
          setImageUrl(undefined);
      }
      setOpen(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-neutral-950 hover:bg-neutral-800 text-white shadow-md transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Add Component
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white text-black p-0 overflow-hidden rounded-[20px] shadow-xl border border-neutral-200/60 max-h-[90vh] flex flex-col mx-auto w-[95vw]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            {/* Image Source Overlay */}
            <div className="relative group w-full h-56 bg-neutral-50 flex items-center justify-center border-b border-neutral-100 overflow-hidden shrink-0 transition-colors hover:bg-neutral-100/80">
               {imageUrl ? (
                  <>
                      <img src={imageUrl} alt="Component Preview" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white backdrop-blur-[2px]">
                          <Upload className="h-6 w-6 mb-1.5 drop-shadow-md" />
                          <span className="text-sm font-medium drop-shadow-md">Change Image</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                      </label>
                  </>
               ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-neutral-400 transition-colors group-hover:text-violet-600">
                      <div className="flex flex-col items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                          <div className="p-3 bg-white rounded-full shadow-sm border border-neutral-100 group-hover:border-violet-200 group-hover:shadow-md transition-all">
                              <Upload className="h-6 w-6 opacity-80" strokeWidth={2} />
                          </div>
                          <span className="text-xs font-bold tracking-wider uppercase text-neutral-500 group-hover:text-violet-600">Upload Component Image</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                  </label>
               )}
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
              <div className="space-y-1.5">
                <DialogTitle className="text-xl font-bold text-neutral-900 tracking-tight text-left">Add New Component</DialogTitle>
              </div>

              <div className="space-y-4">
                <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ADA Fruit" {...field} className="h-10 border-neutral-200 focus-visible:ring-violet-500/20 focus-visible:border-violet-500 bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU / Part Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ADA-FRUIT" {...field} className="h-10 border-neutral-200 focus-visible:ring-violet-500/20 focus-visible:border-violet-500 font-mono text-sm bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-10 border-neutral-200 focus-visible:ring-violet-500/20 focus-visible:border-violet-500 bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Critical Stock
                      {!isAdmin && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ShieldAlert className="h-3.5 w-3.5 text-amber-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-neutral-900 text-white border-neutral-800 text-[11px]">
                              Only administrators can modify critical stock levels.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={!isAdmin}
                          className={`h-10 border-neutral-200 focus-visible:ring-violet-500/20 focus-visible:border-violet-500 bg-white ${!isAdmin ? "bg-neutral-50 text-neutral-400 cursor-not-allowed pr-8" : ""}`} 
                        />
                        {!isAdmin && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="h-3 w-3 text-neutral-300" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 w-full bg-white text-black border-neutral-200 focus:ring-violet-500/20 focus:border-violet-500">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" sideOffset={4} className="bg-white text-black">
                        <SelectItem value="Enclosure">Enclosure</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                        <SelectItem value="Cable">Cable</SelectItem>
                        <SelectItem value="RF">Radio Frequency</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="warehouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 w-full bg-white text-black border-neutral-200 focus:ring-violet-500/20 focus:border-violet-500 [&>span]:truncate [&>span]:w-full text-left">
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" sideOffset={4} className="bg-white text-black">
                        <SelectItem value="PWX IoT Hub">PWX IoT Hub</SelectItem>
                        <SelectItem value="Jenny's">Jenny&apos;s</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full bg-white text-black border-neutral-200 focus:ring-violet-500/20 focus:border-violet-500 text-left">
                        <SelectValue placeholder="Select Origin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" sideOffset={4} className="bg-white text-black">
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Import">Import</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 mt-auto shrink-0">
                <DialogFooter className="flex gap-2 sm:justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="h-10 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 font-medium w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    className="h-10 bg-neutral-950 hover:bg-neutral-800 text-white font-medium shadow-md transition-colors w-full sm:w-auto"
                >
                    Save Component
                </Button>
                </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
