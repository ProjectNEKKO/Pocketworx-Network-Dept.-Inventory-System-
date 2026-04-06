import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Package, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export interface GatewayActivity {
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface GatewayItem {
  id?: number;
  name: string;
  sku: string;
  location: string;
  quantity: number;
  image?: string;
  history?: GatewayActivity[];
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  quantity: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Quantity must be a non-negative number"),
  location: z.string().min(1, "Warehouse is required"),
});

export function AddGatewaysDialog({
  onAdd,
  existingSkus,
}: {
  onAdd: (gateway: GatewayItem) => void;
  existingSkus: string[];
}) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      quantity: "1",
      location: "PWX IoT Hub",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if SKU already exists
    if (existingSkus.includes(values.sku)) {
      form.setError("sku", {
        type: "manual",
        message: "This SKU is already defined in the system. Please use a unique SKU.",
      });
      return;
    }

    onAdd({
      name: values.name,
      sku: values.sku,
      quantity: Number(values.quantity),
      location: values.location,
      image: imageUrl,
    });
    
    // Reset form and close dialog
    form.reset();
    setImageUrl(undefined);
    setOpen(false);
  }

  // Quick action function to generate SKU based on name and warehouse
  function generateLinkedSku() {
      const name = form.getValues("name");
      const warehouse = form.getValues("location");
      
      if (!name) return;

      let prefix = "GW";
      if (name.toLowerCase().includes("femto")) prefix = "GW-FM";
      else if (name.toLowerCase().includes("915")) prefix = "GW-915";
      else if (name.toLowerCase().includes("868")) prefix = "GW-868";

      const modifier = name.toLowerCase().includes("indoor") ? "I" : "O";
      const whCode = warehouse === "PWX IoT Hub" ? "A" : "B";

      form.setValue("sku", `${prefix}-${modifier}${whCode}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-neutral-950 hover:bg-neutral-800 text-white shadow-md transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Add Gateway
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black p-0 overflow-hidden rounded-[20px] shadow-xl border border-neutral-200/60 max-h-[90vh] flex flex-col mx-auto w-[95vw]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            {/* Image Source Overlay */}
            <div className="relative group w-full h-56 bg-neutral-50 flex items-center justify-center border-b border-neutral-100 overflow-hidden shrink-0 transition-colors hover:bg-neutral-100/80">
               {imageUrl ? (
                  <>
                      <img src={imageUrl} alt="Gateway Preview" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white backdrop-blur-[2px]">
                          <Upload className="h-6 w-6 mb-1.5 drop-shadow-md" />
                          <span className="text-sm font-medium drop-shadow-md">Change Image</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                  </>
               ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-neutral-400 transition-colors group-hover:text-blue-600">
                      <div className="flex flex-col items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                          <div className="p-3 bg-white rounded-full shadow-sm border border-neutral-100 group-hover:border-blue-200 group-hover:shadow-md transition-all">
                              <Upload className="h-6 w-6 opacity-80" strokeWidth={2} />
                          </div>
                          <span className="text-xs font-bold tracking-wider uppercase text-neutral-500 group-hover:text-blue-600">Upload Gateway Image</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
               )}
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
              <div className="space-y-1.5">
                <DialogTitle className="text-xl font-bold text-neutral-900 tracking-tight">Add New Gateway</DialogTitle>
                <DialogDescription className="text-neutral-500 text-sm">
                  Register a new gateway to the inventory. Please ensure the SKU is unique.
                </DialogDescription>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-neutral-700">Gateway Name/Model</FormLabel>
                      <FormControl>
                        <Input 
                            placeholder="e.g. Gateway 915 Outdoor" 
                            {...field} 
                            className="h-10 border-neutral-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 bg-white"
                            // Optional: Automatically trigger SKU generation when name blurs 
                            onBlur={() => {
                                field.onBlur();
                                if (!form.getValues("sku")) generateLinkedSku();
                            }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-3">
                        <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm font-semibold text-neutral-700">SKU / ID</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g. GW-915-OA" 
                                    className="h-10 border-neutral-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-mono text-sm bg-white"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="col-span-2">
                        <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm font-semibold text-neutral-700">Initial Quantity</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    min="0" 
                                    className="h-10 border-neutral-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 bg-white text-center"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-neutral-700">Warehouse Location</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                            field.onChange(val);
                            generateLinkedSku(); 
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 border-neutral-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent position="popper" sideOffset={4} className="bg-white text-black border-neutral-200">
                          <SelectItem value="PWX IoT Hub">PWX IoT Hub</SelectItem>
                          <SelectItem value="Jenny's">Jenny&apos;s</SelectItem>
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
                    Register Gateway
                </Button>
                </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
