import * as XLSX from "xlsx";
import type { ComponentItem } from "@/app/(protected)/components/add_components";
import type { GatewayItem } from "@/app/(protected)/gateways/add_gateways";

export function downloadExcelTemplate() {
    // 1. Create a blank workbook
    const wb = XLSX.utils.book_new();

    // 2. Add "Components" sheet
    const componentsHeaders = ["Name", "SKU", "Category", "Stock", "Critical Stock", "Warehouse", "Item Source"];
    const wsComponents = XLSX.utils.aoa_to_sheet([
        componentsHeaders,
        ["Example Component", "EX-COMP-01", "Hardware", 100, 20, "PWX IoT Hub", "Local"]
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

export interface ImportResult {
    success: boolean;
    components: { added: ComponentItem[]; updated: ComponentItem[]; };
    gateways: { added: GatewayItem[]; updated: GatewayItem[]; };
    finalComponents: ComponentItem[];
    finalGateways: GatewayItem[];
    errors: string[];
    error?: string; // Critical/Global error
}

export async function processExcelImport(
    file: File,
    currentComponents: ComponentItem[],
    currentGateways: GatewayItem[]
): Promise<ImportResult> {
    try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });

        const addedComponents: ComponentItem[] = [];
        const updatedComponents: ComponentItem[] = [];
        const addedGateways: GatewayItem[] = [];
        const updatedGateways: GatewayItem[] = [];
        const importErrors: string[] = [];

        // Prepopulate maps with current data
        const compMap = new Map<string, ComponentItem>();
        for (const c of currentComponents) {
            const wh = c.warehouse || "PWX IoT Hub";
            compMap.set(`${c.sku.toLowerCase()}-${wh.toLowerCase()}`, { ...c });
        }

        const gwMap = new Map<string, GatewayItem>();
        for (const g of currentGateways) {
            const loc = g.location || "PWX IoT Hub";
            gwMap.set(`${g.sku.toLowerCase()}-${loc.toLowerCase()}`, { ...g });
        }

        // --- Process Components ---
        const wsComponents = wb.Sheets["Components"];
        if (wsComponents) {
            const rawComponents = XLSX.utils.sheet_to_json<any>(wsComponents);

            let rowIndex = 2; // header is row 1 conceptually
            for (const row of rawComponents) {
                const name = row["Name"] || row["name"];
                const sku = String(row["SKU"] || row["sku"] || row["Part Number"] || "").trim();
                const category = row["Category"] || row["category"];
                let stock = Number(row["Stock"] || row["Current Stock"] || row["stock"]);
                let min = Number(row["Min Stock"] || row["Critical Stock"] || row["min"]);
                const warehouse = String(row["Warehouse"] || row["warehouse"] || "PWX IoT Hub").trim();
                const tag = String(row["Item Source"] || row["item source"] || "Local").trim();

                if (!name || !sku) {
                    importErrors.push(`Components Row ${rowIndex}: Missing required 'Name' or 'SKU'.`);
                    rowIndex++;
                    continue;
                }

                if (!category) {
                    importErrors.push(`Components Row ${rowIndex} (${name}): Missing required 'Category'.`);
                    rowIndex++;
                    continue;
                }

                if (row["Stock"] === undefined && row["Current Stock"] === undefined && row["stock"] === undefined) {
                    importErrors.push(`Components Row ${rowIndex} (${name}): Missing required 'Stock' quantity.`);
                    rowIndex++;
                    continue;
                }

                if (isNaN(stock) || stock < 0) stock = 0;
                if (isNaN(min) || min < 0) min = 0;

                const lookupKey = `${sku.toLowerCase()}-${warehouse.toLowerCase()}`;

                if (compMap.has(lookupKey)) {
                    // Update: Record the quantity to ADD (delta)
                    const existing = compMap.get(lookupKey)!;
                    // We record the incoming 'stock' as the adjustment amount
                    const updateCopy = { ...existing, stock: stock };
                    updatedComponents.push(updateCopy);

                    // Update local map for internal preview consistency if needed
                    existing.stock += stock;
                    if (min > existing.min_stock) existing.min_stock = min;
                    compMap.set(lookupKey, existing);
                } else {
                    // Add new
                    const newItem: ComponentItem = {
                        name: String(name),
                        sku: sku,
                        category: String(category || "Accessories"),
                        stock: stock,
                        min_stock: min,
                        warehouse: warehouse,
                        tag: tag,
                    };
                    addedComponents.push(newItem);
                    compMap.set(lookupKey, newItem);
                }
                rowIndex++;
            }
        }

        // --- Process Gateways ---
        const wsGateways = wb.Sheets["Gateways"];
        if (wsGateways) {
            const rawGateways = XLSX.utils.sheet_to_json<any>(wsGateways);

            let rowIndex = 2;
            for (const row of rawGateways) {
                const name = row["Name"] || row["name"];
                const sku = String(row["SKU"] || row["sku"] || "").trim();
                const location = String(row["Location"] || row["location"] || row["Warehouse"] || "PWX IoT Hub").trim();
                let quantity = Number(row["Quantity"] || row["quantity"] || row["Qty"]);

                if (!name || !sku) {
                    importErrors.push(`Gateways Row ${rowIndex}: Missing required 'Name' or 'SKU'.`);
                    rowIndex++;
                    continue;
                }

                if (row["Quantity"] === undefined && row["quantity"] === undefined && row["Qty"] === undefined) {
                    importErrors.push(`Gateways Row ${rowIndex} (${name}): Missing required 'Quantity'.`);
                    rowIndex++;
                    continue;
                }

                if (isNaN(quantity) || quantity < 0) quantity = 0;

                const lookupKey = `${sku.toLowerCase()}-${location.toLowerCase()}`;

                if (gwMap.has(lookupKey)) {
                    const existing = gwMap.get(lookupKey)!;
                    const updateCopy = { ...existing, quantity: quantity }; // record the delta
                    updatedGateways.push(updateCopy);

                    existing.quantity += quantity;
                    gwMap.set(lookupKey, existing);
                } else {
                    const newItem: GatewayItem = {
                        name: String(name),
                        sku: sku,
                        location: location,
                        quantity: quantity
                    };
                    addedGateways.push(newItem);
                    gwMap.set(lookupKey, newItem);
                }
                rowIndex++;
            }
        }

        if (!wsComponents && !wsGateways) {
            return {
                success: false,
                components: { added: [], updated: [] },
                gateways: { added: [], updated: [] },
                finalComponents: [],
                finalGateways: [],
                errors: [],
                error: "Invalid Excel format. Expected 'Components' or 'Gateways' sheets."
            };
        }

        return {
            success: true,
            components: { added: addedComponents, updated: updatedComponents },
            gateways: { added: addedGateways, updated: updatedGateways },
            finalComponents: Array.from(compMap.values()),
            finalGateways: Array.from(gwMap.values()),
            errors: importErrors
        };
    } catch (e: any) {
        return {
            success: false,
            components: { added: [], updated: [] },
            gateways: { added: [], updated: [] },
            finalComponents: [],
            finalGateways: [],
            errors: [],
            error: e.message || "An error occurred while parsing the file."
        };
    }
}

export function exportComponentsToExcel(components: ComponentItem[]) {
    const wb = XLSX.utils.book_new();
    const headers = ["Name", "SKU", "Category", "Stock", "Critical Stock", "Warehouse", "Item Source"];

    const rows = components.map(c => [
        c.name,
        c.sku,
        c.category,
        c.stock,
        c.min_stock,
        c.warehouse || "PWX IoT Hub",
        c.tag || "Local"
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Components");

    // Trigger download
    XLSX.writeFile(wb, "Pocketworx_Components_Export.xlsx");
}
