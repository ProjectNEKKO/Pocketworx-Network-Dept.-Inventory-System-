import * as XLSX from "xlsx";
import type { ComponentItem } from "@/app/(protected)/components/add_components";
import type { GatewayItem } from "@/app/(protected)/gateways/add_gateways";

export function downloadExcelTemplate() {
    // 1. Create a blank workbook
    const wb = XLSX.utils.book_new();

    // 2. Add "Components" sheet
    const componentsHeaders = ["Name", "SKU", "Category", "Stock", "Critical Stock", "Warehouse"];
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

export async function processExcelImport(
    file: File,
    existingComponentSkus: Set<string>,
    existingGatewaySkus: Set<string>
): Promise<{
    success: boolean;
    componentsAdded: number;
    gatewaysAdded: number;
    newComponents: ComponentItem[];
    newGateways: GatewayItem[];
    error?: string;
}> {
    try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });

        let newComponentsCount = 0;
        let newGatewaysCount = 0;

        // --- Process Components ---
        const wsComponents = wb.Sheets["Components"];
        const newItems: ComponentItem[] = [];
        if (wsComponents) {
            const rawComponents = XLSX.utils.sheet_to_json<any>(wsComponents);
            const trackedSkus = new Set(existingComponentSkus);

            for (const row of rawComponents) {
                const name = row["Name"] || row["name"];
                const sku = String(row["SKU"] || row["sku"] || row["Part Number"] || "").trim();
                const category = row["Category"] || row["category"];
                const stock = Number(row["Stock"] || row["Current Stock"] || row["stock"] || 0);
                const min = Number(row["Min Stock"] || row["Critical Stock"] || row["min"] || 0);
                const warehouse = row["Warehouse"] || row["warehouse"] || "PWX IoT Hub";

                if (name && sku) {
                    const normalizedSku = sku.toLowerCase();
                    if (!trackedSkus.has(normalizedSku)) {
                        newItems.push({
                            name: String(name),
                            sku: sku,
                            category: String(category || "Accessories"),
                            stock: isNaN(stock) ? 0 : stock,
                            min: isNaN(min) ? 0 : min,
                            warehouse: String(warehouse),
                        });
                        trackedSkus.add(normalizedSku);
                    }
                }
            }
            newComponentsCount = newItems.length;
        }

        // --- Process Gateways ---
        const wsGateways = wb.Sheets["Gateways"];
        const newGateways: GatewayItem[] = [];
        if (wsGateways) {
            const rawGateways = XLSX.utils.sheet_to_json<any>(wsGateways);
            const trackedGwSkus = new Set(existingGatewaySkus);

            for (const row of rawGateways) {
                const name = row["Name"] || row["name"];
                const sku = String(row["SKU"] || row["sku"] || "").trim();
                const location = row["Location"] || row["location"] || row["Warehouse"] || "PWX IoT Hub";
                const quantity = Number(row["Quantity"] || row["quantity"] || row["Qty"] || 0);

                if (name && sku) {
                    const normalizedSku = sku.toLowerCase();
                    if (!trackedGwSkus.has(normalizedSku)) {
                        newGateways.push({
                            id: String(name),
                            sku: sku,
                            location: String(location),
                            quantity: isNaN(quantity) ? 0 : quantity
                        });
                        trackedGwSkus.add(normalizedSku);
                    }
                }
            }
            newGatewaysCount = newGateways.length;
        }

        if (!wsComponents && !wsGateways) {
            return {
                success: false,
                componentsAdded: 0,
                gatewaysAdded: 0,
                newComponents: [],
                newGateways: [],
                error: "Invalid Excel format. Expected 'Components' or 'Gateways' sheets."
            };
        }

        return {
            success: true,
            componentsAdded: newComponentsCount,
            gatewaysAdded: newGatewaysCount,
            newComponents: newItems,
            newGateways: newGateways
        };
    } catch (e: any) {
        return {
            success: false,
            componentsAdded: 0,
            gatewaysAdded: 0,
            newComponents: [],
            newGateways: [],
            error: e.message || "An error occurred while parsing the file."
        };
    }
}

export function exportComponentsToExcel(components: ComponentItem[]) {
    const wb = XLSX.utils.book_new();
    const headers = ["Name", "SKU", "Category", "Stock", "Critical Stock", "Warehouse"];
    
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
