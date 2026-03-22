/** Matches rows persisted by the create BOM flow (localStorage). */
export interface StoredComponentRow {
    id: string;
    lineNumber: number;
    level: number;
    partNumber: string;
    description: string;
    qpa: number;
    uom: string;
    unitCost: number;
    manufacturer: string;
    mpn: string;
    refDesignator: string;
    /** When set, line was linked from the Components inventory catalog (SKU). */
    catalogSku?: string;
}

export interface BOMEntry {
    id: string;
    name: string;
    /** Line count for list cards / table (may differ from `componentRows` when demo BOM was duplicated). */
    components: number;
    revision: string;
    status: string;
    author: string;
    lastModified: string;
    description?: string;
    cpn?: string;
    phase?: string;
    assemblyUom?: string;
    targetQty?: number;
    totalCost?: number;
    /** Full lines when loaded from storage or edit flow. */
    componentRows?: StoredComponentRow[];
    /** Persisted when there are no rows but we still show a count (e.g. duplicated seed BOM). */
    componentCount?: number;
}

export function mapRawToEntry(b: Record<string, unknown>): BOMEntry {
    const rawComponents = Array.isArray(b.components)
        ? (b.components as StoredComponentRow[])
        : [];
    const fallbackCount =
        typeof b.componentCount === "number"
            ? b.componentCount
            : typeof b.components === "number"
              ? (b.components as number)
              : 0;
    const lineCount =
        rawComponents.length > 0 ? rawComponents.length : fallbackCount;

    return {
        id: String(b.id ?? ""),
        name: String(b.name ?? ""),
        components: lineCount,
        revision: String(b.revision ?? "Rev A"),
        status: String(b.status ?? "Draft"),
        author: String(b.author ?? "Current User"),
        lastModified: String(b.lastModified ?? ""),
        description: typeof b.description === "string" ? b.description : undefined,
        cpn: typeof b.cpn === "string" ? b.cpn : undefined,
        phase: typeof b.phase === "string" ? b.phase : undefined,
        assemblyUom:
            typeof b.assemblyUom === "string" ? b.assemblyUom : undefined,
        targetQty: typeof b.targetQty === "number" ? b.targetQty : undefined,
        totalCost: typeof b.totalCost === "number" ? b.totalCost : undefined,
        componentRows: rawComponents.length > 0 ? rawComponents : undefined,
        componentCount:
            rawComponents.length === 0 && typeof b.componentCount === "number"
                ? b.componentCount
                : undefined,
    };
}

export function entryToStored(b: BOMEntry): Record<string, unknown> {
    const rows = b.componentRows ?? [];
    const payload: Record<string, unknown> = {
        id: b.id,
        name: b.name,
        cpn: b.cpn ?? "",
        revision: b.revision,
        phase: b.phase ?? "Prototype",
        assemblyUom: b.assemblyUom ?? "Each",
        targetQty: b.targetQty ?? 1,
        description: b.description ?? "",
        components: rows,
        totalCost: b.totalCost ?? 0,
        status: b.status,
        author: b.author,
        lastModified: b.lastModified,
    };
    if (rows.length === 0 && b.components > 0) {
        payload.componentCount = b.components;
    }
    return payload;
}

export const defaultBOMs: BOMEntry[] = [
    {
        id: "BOM-127",
        name: "PWX Gateway v3.2",
        components: 24,
        revision: "Rev C",
        status: "Active",
        author: "Alice Smith",
        lastModified: "2 hours ago",
    },
    {
        id: "BOM-126",
        name: "PWX Sensor Node v2",
        components: 18,
        revision: "Rev B",
        status: "Active",
        author: "Bob Jones",
        lastModified: "1 day ago",
    },
    {
        id: "BOM-125",
        name: "PWX Base Station",
        components: 42,
        revision: "Rev A",
        status: "Draft",
        author: "Charlie Brown",
        lastModified: "3 days ago",
    },
    {
        id: "BOM-124",
        name: "PWX Gateway v3.1",
        components: 22,
        revision: "Rev B",
        status: "Archived",
        author: "Diana Prince",
        lastModified: "1 week ago",
    },
    {
        id: "BOM-123",
        name: "Power Supply Module",
        components: 11,
        revision: "Rev D",
        status: "Active",
        author: "Eve Adams",
        lastModified: "2 weeks ago",
    },
];

/** Resolve a BOM for the create/edit page when sessionStorage is missing (e.g. refresh). */
export function findBomById(id: string): BOMEntry | null {
    try {
        const saved = JSON.parse(
            localStorage.getItem("pocketworx_boms") || "[]"
        ) as unknown[];
        for (const raw of saved) {
            const b = mapRawToEntry(raw as Record<string, unknown>);
            if (b.id === id) return b;
        }
    } catch {
        /* ignore */
    }
    return defaultBOMs.find((b) => b.id === id) ?? null;
}
