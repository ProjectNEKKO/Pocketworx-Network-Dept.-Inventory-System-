"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Upload, X } from "lucide-react";

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

export interface ComponentItem {
  name: string;
  sku: string;
  stock: number;
  min: number;
  category: string;
  image?: string;
  warehouse?: string;
  /** Optional standard unit cost for BOM roll-up (PHP). */
  unitCost?: number;
}

const formSchema = z.object({
  name: z.string().min(1, "Component name is required"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Stock must be a non-negative number"),
  min: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Minimum stock must be a non-negative number"),
  unitCost: z.string().refine(
    (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0),
    "Unit cost must be a non-negative number"
  ),
  category: z.string().min(1, "Category is required"),
  warehouse: z.string().min(1, "Warehouse is required"),
});

export function AddComponentsDialog({
  onAdd,
  existingSkus,
}: {
  onAdd: (component: ComponentItem) => void;
  existingSkus: string[];
}) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      stock: "",
      min: "",
      unitCost: "",
      category: "",
      warehouse: "PWX IoT Hub",
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
      min: Number(values.min),
      category: values.category,
      warehouse: values.warehouse,
      image: imageUrl,
      unitCost:
        values.unitCost === "" ? undefined : Number(values.unitCost),
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
        <Button className="bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-400">
          <Plus className="mr-2 h-4 w-4" />
          Add Component
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-black">
        <DialogHeader>
          <DialogTitle>Add New Component</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Image Upload Area */}
            <div className="flex flex-col items-center justify-center mb-6">
                <div 
                    className="relative group flex h-32 w-32 items-center justify-center rounded-2xl bg-neutral-100/60 overflow-hidden border-2 border-dashed border-neutral-300 hover:border-violet-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imageUrl ? (
                        <>
                            <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                            <button 
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                            <Upload className="h-6 w-6 text-neutral-400 group-hover:text-violet-500 transition-colors" />
                            <span className="text-[10px] font-medium group-hover:text-violet-600 transition-colors">Upload Image</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        ref={fileInputRef}
                    />
                </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ADA Fruit" {...field} />
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
                    <Input placeholder="e.g. ADA-FRUIT" {...field} />
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
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard unit cost (PHP, optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-white text-black">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" sideOffset={4} className="bg-white text-black">
                        <SelectItem value="Enclosure">Enclosure</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                        <SelectItem value="Cable">Cable</SelectItem>
                        <SelectItem value="RF">RF</SelectItem>
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
                        <SelectTrigger className="w-full bg-white text-black">
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
                className="bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:from-violet-500 hover:to-purple-400"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
