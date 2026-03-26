import * as XLSX from "xlsx";
import type { ComponentItem } from "@/app/(protected)/components/add_components";
import type { GatewayItem } from "@/app/(protected)/gateways/add_gateways";
import { loadComponentCatalog, saveComponentCatalog } from "./inventory-catalog";
import { COMPONENT_CATALOG_SEED } from "@/data/components-seed";
import { loadGwCatalog, saveGwCatalog } from "./gateway-catalog";

export function downloadExcelTemplate() {
    // 1. Create a blank workbook
    const wb = XLSX.utils.book_new();

    // 2. Add "Components" sheet
    const componentsHeaders = ["Name", "SKU", "Category", "Stock", "Min Stock", "Warehouse"];
    const wsComponents = XLSX.utils.aoa_to_sheet([
        componentsHeaders,
        ["Example Component", "EX-COMP-01", "Hardware", 100, 20, "PWX IoT Hub"]
    ]);
    XLSX.utils.book_append_sheet(wb, wsComponents, "Components");

    // 3. Add "Gateways" sheet
    const gatewaysHeaders = ["Name", "SKU", "Location", "Quantity"];
    const wsGateways = XLSX.utils.aoa_to_sheet([
        gatewaysHeaders,
        ["Example Gateway Outdoor", "EX-GW-OA", "Jenny's", 5]
    ]);
    XLSX.utils.book_append_sheet(wb, wsGateways, "Gateways");

    // 4. Trigger download
    XLSX.writeFile(wb, "Inventory_Import_Template.xlsx");
}

export async function processExcelImport(file: File): Promise<{
    success: boolean;
    componentsAdded: number;
    gatewaysAdded: number;
    error?: string;
}> {
    try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });

        let newComponentsCount = 0;
        let newGatewaysCount = 0;

        // --- Process Components ---
        const wsComponents = wb.Sheets["Components"];
        if (wsComponents) {
            const rawComponents = XLSX.utils.sheet_to_json<any>(wsComponents);
            const currentComponents = loadComponentCatalog(COMPONENT_CATALOG_SEED);
            
            const existingSkus = new Set(currentComponents.map(c => c.sku.toLowerCase()));
            const newItems: ComponentItem[] = [];

            for (const row of rawComponents) {
                // Determine property mapping
                const name = row["Name"] || row["name"];
                const sku = row["SKU"] || row["sku"] || row["Part Number"];
                const category = row["Category"] || row["category"];
                const stock = Number(row["Stock"] || row["Current Stock"] || row["stock"] || 0);
                const min = Number(row["Min Stock"] || row["Critical Stock"] || row["min"] || 0);
                const warehouse = row["Warehouse"] || row["warehouse"] || "PWX IoT Hub";

                if (name && sku) {
                    if (!existingSkus.has(String(sku).toLowerCase())) {
                        newItems.push({
                            name: String(name),
                            sku: String(sku),
                            category: String(category || "Accessories"),
                            stock: isNaN(stock) ? 0 : stock,
                            min: isNaN(min) ? 0 : min,
                            warehouse: String(warehouse),
                        });
                        existingSkus.add(String(sku).toLowerCase());
                    }
                }
            }

            if (newItems.length > 0) {
                const updatedComponents = [...currentComponents, ...newItems];
                saveComponentCatalog(updatedComponents);
                newComponentsCount = newItems.length;
            }
        }

        // --- Process Gateways ---
        const wsGateways = wb.Sheets["Gateways"];
        if (wsGateways) {
            const rawGateways = XLSX.utils.sheet_to_json<any>(wsGateways);
            const currentGateways = loadGwCatalog();
            
            const existingSkus = new Set(currentGateways.map(g => g.sku.toLowerCase()));
            const newGateways: GatewayItem[] = [];

            for (const row of rawGateways) {
                const name = row["Name"] || row["name"];
                const sku = row["SKU"] || row["sku"];
                const location = row["Location"] || row["location"] || row["Warehouse"] || "PWX IoT Hub";
                const quantity = Number(row["Quantity"] || row["quantity"] || row["Qty"] || 0);

                if (name && sku) {
                    if (!existingSkus.has(String(sku).toLowerCase())) {
                        newGateways.push({
                            id: String(name),
                            sku: String(sku),
                            location: String(location),
                            quantity: isNaN(quantity) ? 0 : quantity
                        });
                        existingSkus.add(String(sku).toLowerCase());
                    }
                }
            }

            if (newGateways.length > 0) {
                const updatedGateways = [...currentGateways, ...newGateways];
                saveGwCatalog(updatedGateways);
                newGatewaysCount = newGateways.length;
            }
        }

        if (!wsComponents && !wsGateways) {
            return {
                success: false,
                componentsAdded: 0,
                gatewaysAdded: 0,
                error: "Invalid Excel format. Expected 'Components' or 'Gateways' sheets."
            };
        }

        return {
            success: true,
            componentsAdded: newComponentsCount,
            gatewaysAdded: newGatewaysCount
        };
    } catch (e: any) {
        return {
            success: false,
            componentsAdded: 0,
            gatewaysAdded: 0,
            error: e.message || "An error occurred while parsing the file."
        };
    }
}

export function exportComponentsToExcel(components: ComponentItem[]) {
    const wb = XLSX.utils.book_new();
    const headers = ["Name", "SKU", "Category", "Stock", "Min Stock", "Warehouse"];
    
    const rows = components.map(c => [
        c.name,
        c.sku,
        c.category,
        c.stock,
        c.min,
        c.warehouse || "PWX IoT Hub"
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Components");
    
    // Trigger download
    XLSX.writeFile(wb, "Pocketworx_Components_Export.xlsx");
}
