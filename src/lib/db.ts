import { Pool, PoolClient } from 'pg';

// Initialize the Postgres Connection Pool.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// --- Types ---

export type User = {
    id: number;
    name: string | null;
    email: string;
    password_hash: string;
    role: 'admin' | 'co-admin' | 'user';
    status: 'Active' | 'Inactive';
    created_at?: Date;
    updated_at?: Date;
};

export type StockRequest = {
    id: number;
    type: 'component' | 'gateway';
    item_sku: string;
    item_name: string;
    requested_qty: number;
    requested_by: string; // email
    status: 'pending' | 'accepted' | 'declined';
    is_processed: boolean;
    created_at: Date;
};

export type Notification = {
    id: number;
    user_id: number | null;
    message: string;
    type: string;
    related_id: number | null;
    is_read: boolean;
    created_at: Date;
};

export type ComponentItem = {
    id: number;
    sku: string;
    name: string;
    stock: number;
    min_stock: number;
    category: string;
    warehouse: string;
    tag?: string;
    image?: string;
    created_at: Date;
    updated_at: Date;
};

export type GatewayItem = {
    id: number;
    sku: string;
    name: string;
    location: string;
    quantity: number;
    image?: string;
    created_at: Date;
    updated_at: Date;
};

export type ActivityLog = {
    id: number;
    action: string;
    detail: string;
    user_name: string;
    item_sku: string | null;
    created_at: Date;
};

// --- Users ---

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const queryText = `
            SELECT id, name, email, password_hash, role, status
            FROM users
            WHERE email = $1;
        `;
        const { rows } = await pool.query(queryText, [email.toLowerCase()]);
        return rows[0] || null;
    } catch (error) {
        console.error("[CRITICAL DB EXCEPTION] Failed user lookup:", error);
        throw new Error("Internal Database Error");
    }
}

export async function getAllUsers(): Promise<Omit<User, 'password_hash'>[]> {
    try {
        const queryText = `
            SELECT id, name, email, role, status, created_at, updated_at
            FROM users
            ORDER BY id ASC;
        `;
        const { rows } = await pool.query(queryText);
        return rows;
    } catch (error) {
        console.error("Failed fetching all users:", error);
        throw new Error("Internal Database Error");
    }
}

export async function updateUserRole(email: string, role: 'admin' | 'co-admin' | 'user'): Promise<void> {
    try {
        const queryText = `
            UPDATE users
            SET role = $1, updated_at = CURRENT_TIMESTAMP
            WHERE email = $2;
        `;
        await pool.query(queryText, [role, email.toLowerCase()]);
    } catch (error) {
        console.error("Failed updating user role:", error);
        throw new Error("Internal Database Error");
    }
}

export async function updateUserProfile(email: string, updates: { name?: string, role?: string }): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (updates.name !== undefined) {
            fields.push(`name = $${idx++}`);
            values.push(updates.name);

            // Retroactively update activity logs to ensure name is consistent everywhere
            try {
                await client.query(
                    `UPDATE activity_logs SET user_name = $1 WHERE user_email = $2`,
                    [updates.name, email.toLowerCase()]
                );
            } catch (err: any) {
                // Table might not exist yet, suppress error
                if (err.code !== '42P01') throw err;
            }
        }
        if (updates.role !== undefined) {
            fields.push(`role = $${idx++}`);
            values.push(updates.role);
        }

        if (fields.length > 0) {
            values.push(email.toLowerCase());
            const queryText = `
                UPDATE users
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE email = $${idx};
            `;
            await client.query(queryText, values);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Failed updating user profile:", error);
        throw new Error("Internal Database Error");
    } finally {
        client.release();
    }
}

export async function deleteUserByEmail(email: string): Promise<void> {
    try {
        const queryText = `
            DELETE FROM users
            WHERE email = $1;
        `;
        await pool.query(queryText, [email.toLowerCase()]);
    } catch (error) {
        console.error("Failed deleting user:", error);
        throw new Error("Internal Database Error");
    }
}

export async function createUser(
    name: string,
    email: string,
    passwordHash: string,
    role: string,
    status: string = 'Active'
): Promise<User> {
    try {
        const queryText = `
            INSERT INTO users (name, email, password_hash, role, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, role, status, created_at, updated_at;
        `;
        const { rows } = await pool.query(queryText, [name, email.toLowerCase(), passwordHash, role, status]);
        return rows[0];
    } catch (error: any) {
        console.error("Failed creating user:", error);
        if (error.code === '23505') throw new Error("User with this email already exists");
        throw new Error("Internal Database Error");
    }
}

// --- Inventory (Components) ---

export async function getInventoryComponents(): Promise<ComponentItem[]> {
    try {
        const { rows } = await pool.query("SELECT *, image_url AS image FROM inventory_components ORDER BY name ASC");
        return rows;
    } catch (error) {
        console.error("Failed fetching components:", error);
        throw new Error("Internal Database Error");
    }
}

export async function upsertComponent(item: Partial<ComponentItem>): Promise<ComponentItem> {
    try {
        const queryText = `
            INSERT INTO inventory_components (sku, name, stock, min_stock, category, warehouse, tag, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (sku, warehouse) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                stock = EXCLUDED.stock,
                min_stock = EXCLUDED.min_stock,
                category = EXCLUDED.category,
                tag = EXCLUDED.tag,
                image_url = COALESCE(EXCLUDED.image_url, inventory_components.image_url),
                updated_at = CURRENT_TIMESTAMP
            RETURNING *, image_url AS image;
        `;
        const { rows } = await pool.query(queryText, [
            item.sku?.toUpperCase().trim(),
            item.name,
            item.stock,
            item.min_stock || (item as any).min || 0,
            item.category,
            item.warehouse || "PWX IoT Hub",
            item.tag || "Local",
            item.image
        ]);
        return rows[0];
    } catch (error) {
        console.error("Failed upserting component:", error);
        throw new Error("Internal Database Error");
    }
}

export async function logCriticalStockChange(sku: string, warehouse: string, oldVal: number, newVal: number, changedBy: string): Promise<void> {
    try {
        // Ensure table exists (Phase 2 Robustness)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS critical_stock_logs (
                id SERIAL PRIMARY KEY,
                item_sku TEXT NOT NULL,
                warehouse TEXT NOT NULL,
                old_value INTEGER NOT NULL,
                new_value INTEGER NOT NULL,
                changed_by TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_critical_stock_sku ON critical_stock_logs(item_sku);
        `);

        const query = `
            INSERT INTO critical_stock_logs (item_sku, warehouse, old_value, new_value, changed_by)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(query, [sku.toUpperCase().trim(), warehouse, oldVal, newVal, changedBy]);
    } catch (error) {
        console.error("Failed to log critical stock change:", error);
    }
}

/**
 * Performs a partial update on a component identified by SKU and Warehouse.
 */
export async function updateComponent(sku: string, warehouse: string, updates: Partial<ComponentItem>, changedBy?: string): Promise<ComponentItem> {
    try {
        // Fetch current values first if we are updating min_stock and need to log
        // Support 'min' as an alias for 'min_stock' in updates
        const minStockToUpdate = updates.min_stock !== undefined ? updates.min_stock : (updates as any).min;
        let oldMinStock: number | undefined;
        
        if (minStockToUpdate !== undefined && changedBy) {
            const { rows: currentRows } = await pool.query(
                "SELECT min_stock FROM inventory_components WHERE sku = $1 AND warehouse = $2",
                [sku.toUpperCase().trim(), warehouse || "PWX IoT Hub"]
            );
            if (currentRows.length > 0) {
                oldMinStock = currentRows[0].min_stock;
            }
        }

        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (updates.name !== undefined) { fields.push(`name = $${idx++}`); values.push(updates.name); }
        if (updates.stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(updates.stock); }
        if (minStockToUpdate !== undefined) { fields.push(`min_stock = $${idx++}`); values.push(minStockToUpdate); }
        if (updates.category !== undefined) { fields.push(`category = $${idx++}`); values.push(updates.category); }
        if (updates.tag !== undefined) { fields.push(`tag = $${idx++}`); values.push(updates.tag); }
        if (updates.image !== undefined) { fields.push(`image_url = $${idx++}`); values.push(updates.image); }

        if (fields.length === 0) throw new Error("No fields provided for update");

        values.push(sku.toUpperCase().trim());
        const skuIdx = idx++;
        values.push(warehouse || "PWX IoT Hub");
        const whIdx = idx++;

        const queryText = `
            UPDATE inventory_components 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE sku = $${skuIdx} AND warehouse = $${whIdx}
            RETURNING *, image_url AS image;
        `;
        const result = await pool.query(queryText, values);
        if (result.rows.length === 0) throw new Error("Component not found");

        // Log the change if min_stock was changed
        if (minStockToUpdate !== undefined && changedBy && oldMinStock !== undefined && oldMinStock !== minStockToUpdate) {
            await logCriticalStockChange(sku, warehouse, oldMinStock, minStockToUpdate, changedBy);
        }

        return result.rows[0];
    } catch (error) {
        console.error("Failed updating component:", error);
        throw error;
    }
}


/**
 * Atomically adjusts component stock by a delta (positive or negative).
 * Prevents race conditions and ensures stock doesn't go below 0.
 */
export async function adjustComponentStock(sku: string, warehouse: string, delta: number): Promise<ComponentItem> {
    try {
        const queryText = `
            UPDATE inventory_components 
            SET stock = GREATEST(0, stock + $1),
                updated_at = CURRENT_TIMESTAMP
            WHERE sku = $2 AND warehouse = $3
            RETURNING *;
        `;
        const { rows } = await pool.query(queryText, [delta, sku.toUpperCase().trim(), warehouse || "PWX IoT Hub"]);
        if (rows.length === 0) throw new Error("Component not found in specified warehouse");
        return rows[0];
    } catch (error) {
        console.error("Failed adjusting component stock:", error);
        throw error;
    }
}


export async function deleteComponent(sku: string, warehouse: string): Promise<void> {
    try {
        await pool.query("DELETE FROM inventory_components WHERE sku = $1 AND warehouse = $2", [sku, warehouse]);
    } catch (error) {
        console.error("Failed deleting component:", error);
        throw new Error("Internal Database Error");
    }
}

// --- Gateways ---

export async function getGateways(): Promise<GatewayItem[]> {
    try {
        const { rows } = await pool.query("SELECT *, image_url AS image FROM gateways ORDER BY name ASC");
        return rows;
    } catch (error) {
        console.error("Failed fetching gateways:", error);
        throw new Error("Internal Database Error");
    }
}

export async function upsertGateway(gw: Partial<GatewayItem>): Promise<GatewayItem> {
    try {
        const queryText = `
            INSERT INTO gateways (sku, name, location, quantity, image_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (sku) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                location = EXCLUDED.location,
                quantity = EXCLUDED.quantity,
                image_url = COALESCE(EXCLUDED.image_url, gateways.image_url),
                updated_at = CURRENT_TIMESTAMP
            RETURNING *, image_url AS image;
        `;
        const { rows } = await pool.query(queryText, [
            gw.sku?.toUpperCase().trim(),
            gw.name,
            gw.location || "PWX IoT Hub",
            gw.quantity,
            gw.image
        ]);
        return rows[0];
    } catch (error) {
        console.error("Failed upserting gateway:", error);
        throw new Error("Internal Database Error");
    }
}

export async function deleteGateway(sku: string): Promise<void> {
    try {
        await pool.query("DELETE FROM gateways WHERE sku = $1", [sku]);
    } catch (error) {
        console.error("Failed deleting gateway:", error);
        throw new Error("Internal Database Error");
    }
}

/**
 * Atomically adjusts gateway quantity by a delta (positive or negative).
 * Prevents race conditions.
 */
export async function adjustGatewayQuantity(sku: string, delta: number): Promise<GatewayItem> {
    try {
        const queryText = `
            UPDATE gateways 
            SET quantity = GREATEST(0, quantity + $1),
                updated_at = CURRENT_TIMESTAMP
            WHERE sku = $2
            RETURNING *;
        `;
        const { rows } = await pool.query(queryText, [delta, sku.toUpperCase().trim()]);
        if (rows.length === 0) throw new Error("Gateway not found");
        return rows[0];
    } catch (error) {
        console.error("Failed adjusting gateway quantity:", error);
        throw error;
    }
}

// --- Stock Requests ---

export async function createStockRequest(
    type: string,
    itemSku: string,
    itemName: string,
    requestedQty: number,
    requestedBy: string
): Promise<StockRequest> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const queryText = `
            INSERT INTO stock_requests (type, item_sku, item_name, requested_qty, requested_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const { rows } = await client.query(queryText, [
            type,
            itemSku.toUpperCase().trim(),
            itemName,
            requestedQty,
            requestedBy.toLowerCase().trim()
        ]);
        const newRequest = rows[0];

        // Create notification for admins
        const notificationMsg = `${requestedBy} requested ${requestedQty} units of ${itemName} (${itemSku})`;
        await client.query(`
            INSERT INTO notifications (message, type, related_id)
            VALUES ($1, $2, $3)
        `, [notificationMsg, 'stock_request', newRequest.id]);

        await client.query('COMMIT');
        return newRequest;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Failed creating stock request:", error);
        throw new Error("Internal Database Error");
    } finally {
        client.release();
    }
}

export async function getStockRequests(): Promise<StockRequest[]> {
    try {
        const { rows } = await pool.query("SELECT * FROM stock_requests ORDER BY created_at DESC");
        return rows;
    } catch (error) {
        console.error("Failed fetching stock requests:", error);
        throw new Error("Internal Database Error");
    }
}

export async function updateStockRequestStatus(id: number, status: string, processedBy?: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Fetch the request
        const { rows: reqRows } = await client.query("SELECT * FROM stock_requests WHERE id = $1 FOR UPDATE", [id]);
        if (reqRows.length === 0) throw new Error("Request not found");
        const request = reqRows[0] as StockRequest;

        // Prevent double processing
        if (request.is_processed && status === 'accepted') {
            throw new Error("Request already processed and accepted.");
        }

        // 2. If accepting, attempt to deduct inventory
        if (status === 'accepted' && !request.is_processed) {
            const absQty = Math.abs(request.requested_qty);
            console.log(`[STOCK_DEDUCTION_DEBUG] Processing Request ID: ${id}`);
            console.log(`[STOCK_DEDUCTION_DEBUG] Item SKU: ${request.item_sku}, Type: ${request.type}`);
            console.log(`[STOCK_DEDUCTION_DEBUG] Original Qty: ${request.requested_qty}, Normalized Qty: ${absQty}`);

            if (request.type === 'component') {
                // We need to know which warehouse. Since the request currently doesn't store warehouse, 
                // we'll assume the request is for the SKU in any warehouse that has stock.
                const { rows: compRows } = await client.query(
                    "SELECT id, sku, stock, warehouse FROM inventory_components WHERE sku = $1 AND stock >= $2 LIMIT 1",
                    [request.item_sku, absQty]
                );

                if (compRows.length === 0) {
                    const { rows: allWhRows } = await client.query(
                        "SELECT warehouse, stock FROM inventory_components WHERE sku = $1",
                        [request.item_sku]
                    );
                    const whStocks = allWhRows.map(r => `${r.warehouse}: ${r.stock}`).join(', ') || 'N/A';
                    console.error(`[STOCK_DEDUCTION_FAILED] Insufficient stock for ${request.item_sku}. Needed: ${absQty}. Available: [${whStocks}]`);
                    throw new Error(`Insufficient stock for ${request.item_sku}. Needed: ${absQty}. Available in warehouses: ${whStocks}`);
                }

                const comp = compRows[0];
                console.log(`[STOCK_DEDUCTION_SUCCESS] Deducting ${absQty} units from ${comp.sku} in ${comp.warehouse} (Stock before: ${comp.stock})`);
                await client.query(
                    "UPDATE inventory_components SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                    [absQty, comp.id]
                );
            } else {
                const { rows: gwRows } = await client.query(
                    "SELECT quantity FROM gateways WHERE sku = $1 AND quantity >= $2",
                    [request.item_sku, absQty]
                );

                if (gwRows.length === 0) {
                    const { rows: currGw } = await client.query("SELECT quantity FROM gateways WHERE sku = $1", [request.item_sku]);
                    const currentQty = currGw.length > 0 ? currGw[0].quantity : 0;
                    console.error(`[STOCK_DEDUCTION_FAILED] Insufficient gateway stock for ${request.item_sku}. Needed: ${absQty}, Available: ${currentQty}`);
                    throw new Error(`Insufficient gateway stock for ${request.item_sku}. Needed: ${absQty}, Available: ${currentQty}`);
                }

                console.log(`[STOCK_DEDUCTION_SUCCESS] Deducting ${absQty} units from Gateway ${request.item_sku} (Stock before: ${gwRows[0].quantity})`);
                await client.query(
                    "UPDATE gateways SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE sku = $2",
                    [absQty, request.item_sku]
                );
            }
        }

        // 3. Update the request status and set is_processed
        await client.query(
            "UPDATE stock_requests SET status = $1, is_processed = TRUE WHERE id = $2",
            [status, id]
        );

        if (processedBy) {
            const actionStr = status === 'accepted' ? 'Stock Disbursed' : 'Request Declined';
            const detailStr = status === 'accepted' 
                ? `${request.requested_qty}x ${request.item_name} disbursed for request`
                : `${request.requested_qty}x ${request.item_name} request declined`;
            await logActivity(actionStr, detailStr, processedBy, request.item_sku);
        }

        // 4. Notify the user
        const { rows: userRows } = await client.query("SELECT id FROM users WHERE email = $1", [request.requested_by]);
        if (userRows.length > 0) {
            const userId = userRows[0].id;
            const msg = `Your request for ${request.requested_qty}x ${request.item_name} has been ${status}.`;
            await client.query(
                "INSERT INTO notifications (user_id, message, type, related_id) VALUES ($1, $2, $3, $4)",
                [userId, msg, 'request_update', id]
            );
        }

        await client.query('COMMIT');
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Failed updating stock request status:", error.message);
        throw error;
    } finally {
        client.release();
    }
}

// --- Notifications ---

export async function createNotification(message: string, type: string, relatedId: number | null = null, userId: number | null = null): Promise<void> {
    try {
        await pool.query(`
            INSERT INTO notifications (message, type, related_id, user_id)
            VALUES ($1, $2, $3, $4)
        `, [message, type, relatedId, userId]);
    } catch (error) {
        console.error("Failed creating notification:", error);
    }
}

export async function getUnreadNotifications(userId: number | null = null): Promise<Notification[]> {
    try {
        let query = "SELECT * FROM notifications WHERE is_read = FALSE ";
        const params: any[] = [];

        if (userId) {
            query += "AND (user_id = $1 OR user_id IS NULL) ";
            params.push(userId);
        } else {
            query += "AND user_id IS NULL ";
        }

        query += "ORDER BY created_at DESC";

        const { rows } = await pool.query(query, params);
        return rows;
    } catch (error) {
        console.error("Failed fetching notifications:", error);
        throw new Error("Internal Database Error");
    }
}

export async function markNotificationAsRead(id: number): Promise<void> {
    try {
        await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = $1", [id]);
    } catch (error) {
        console.error("Failed marking notification as read:", error);
        throw new Error("Internal Database Error");
    }
}

export async function markAllNotificationsAsRead(userId?: number): Promise<void> {
    try {
        const query = userId 
            ? "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 OR user_id IS NULL"
            : "UPDATE notifications SET is_read = TRUE WHERE user_id IS NULL";
        const params = userId ? [userId] : [];
        await pool.query(query, params);
    } catch (error) {
        console.error("Failed marking all notifications as read:", error);
        throw new Error("Internal Database Error");
    }
}

// --- Activity Logs ---

export async function logActivity(action: string, detail: string, emailOrName: string, itemSku: string | null = null): Promise<void> {
    try {
        let userName = emailOrName;
        if (emailOrName.includes('@')) {
            const { rows } = await pool.query("SELECT name FROM users WHERE email = $1", [emailOrName]);
            if (rows.length > 0 && rows[0].name) {
                userName = rows[0].name;
            } else {
                userName = emailOrName.split('@')[0];
            }
        }

        // Ensure the table schema has our new columns
        await pool.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                action TEXT NOT NULL,
                detail TEXT NOT NULL,
                user_name VARCHAR(255),
                user_email VARCHAR(255),
                icon_type VARCHAR(255),
                color_class VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS item_sku TEXT;
            CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_activity_logs_item_sku ON activity_logs(item_sku);
        `);

        // We map the incoming emailOrName to both user_name and user_email
        const { rows } = await pool.query(`
            INSERT INTO activity_logs (action, detail, user_name, user_email, item_sku)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [action, detail, userName, emailOrName, itemSku]);
        
        const { sseManager } = require('./sse-clients');
        sseManager.broadcast("activity_update", rows[0]);
    } catch (error) {
        console.error("Failed creating activity log:", error);
    }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
    try {
        const { rows } = await pool.query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200");
        return rows;
    } catch (error) {
        // Table might not exist yet if no action has happened
        if ((error as any).code === '42P01') {
            return [];
        }
        console.error("Failed fetching activity logs:", error);
        throw new Error("Internal Database Error");
    }
}

export async function getItemActivityLogs(itemSku: string): Promise<ActivityLog[]> {
    try {
        const { rows } = await pool.query("SELECT * FROM activity_logs WHERE item_sku = $1 ORDER BY created_at DESC", [itemSku]);
        return rows;
    } catch (error) {
        if ((error as any).code === '42P01') {
            return [];
        }
        console.error("Failed fetching item activity logs:", error);
        throw new Error("Internal Database Error");
    }
}

// --- Dashboard Stats ---

export type DashboardSummary = {
    gateways: { 
        total: number; 
        categories: { name: string; count: number; items: { name: string; location: string }[] }[] 
    };
    components: { 
        total: number; 
        categories: { name: string; count: number; items: { name: string; sku: string; stock: number }[] }[] 
    };
    alerts: { 
        total: number; 
        categories: { name: string; count: number; items: ComponentItem[] }[] 
    };
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
    try {
        const [gwRes, compRes] = await Promise.all([
            pool.query("SELECT name, location, type FROM gateways ORDER BY name ASC"),
            pool.query("SELECT * FROM inventory_components ORDER BY name ASC")
        ]);

        const allGateways = gwRes.rows;
        const allComponents = compRes.rows as ComponentItem[];
        const criticalAlerts = allComponents.filter(c => c.stock <= c.min_stock);

        // 1. Group Gateways by Type
        const gwGroup: Record<string, { name: string; count: number; items: any[] }> = {};
        const gwTypes = ['Femto Outdoor', 'Gateway 868 Indoor & Outdoor', 'Gateway 915 Indoor & Outdoor'];
        gwTypes.forEach(t => gwGroup[t] = { name: t, count: 0, items: [] });
        
        allGateways.forEach(g => {
            const type = g.type || 'Gateway 915 Indoor & Outdoor';
            if (!gwGroup[type]) gwGroup[type] = { name: type, count: 0, items: [] };
            gwGroup[type].count++;
            gwGroup[type].items.push({ name: g.name, location: g.location });
        });

        // 2. Group Components by Category
        const compGroup: Record<string, { name: string; count: number; items: any[] }> = {};
        allComponents.forEach(c => {
            const cat = c.category || 'Uncategorized';
            if (!compGroup[cat]) compGroup[cat] = { name: cat, count: 0, items: [] };
            compGroup[cat].count++;
            compGroup[cat].items.push({ name: c.name, sku: c.sku, stock: c.stock });
        });

        // 3. Group Critical Alerts by Category
        const alertGroup: Record<string, { name: string; count: number; items: any[] }> = {};
        criticalAlerts.forEach(c => {
            const cat = c.category || 'Uncategorized';
            if (!alertGroup[cat]) alertGroup[cat] = { name: cat, count: 0, items: [] };
            alertGroup[cat].count++;
            alertGroup[cat].items.push(c);
        });

        return {
            gateways: {
                total: allGateways.length,
                categories: Object.values(gwGroup).filter(g => g.count > 0)
            },
            components: {
                total: allComponents.length,
                categories: Object.values(compGroup).sort((a,b) => b.count - a.count)
            },
            alerts: {
                total: criticalAlerts.length,
                categories: Object.values(alertGroup).sort((a,b) => b.count - a.count)
            }
        };
    } catch (error) {
        console.error("Failed fetching dashboard summary:", error);
        throw new Error("Internal Database Error");
    }
}
