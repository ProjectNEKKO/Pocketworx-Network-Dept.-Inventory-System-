import { Pool } from 'pg';

// Initialize the Postgres Connection Pool.
// Connection behavior scales automatically based on incoming load concurrently.
const pool = new Pool({
    // We expect standard connection strings universally supplied by Docker, Vercel, Supabase, Neon, etc.
    // e.g., DATABASE_URL="postgresql://user:password@localhost:5432/pwx_inventory"
    connectionString: process.env.DATABASE_URL,
    
    // Uncomment the lines below if connecting to a strict cloud provider requiring SSL
    /*
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : undefined
    */
});

// Strict typing for retrieval mapped exactly to constraints in schema.sql
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

/**
 * Executes a dedicated secure query evaluating the user records by email constraints.
 * 
 * SECURITY: By enforcing the `$1` binding syntax array, the underlying Postgres driver parameterizes 
 * the query entirely, providing inherent defense against SQL Injection without manual sanitation.
 */
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
        console.error("[CRITICAL DB EXCEPTION] Failed validating constraints for user lookup:", error);
        throw new Error("Internal Database Disconnect");
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
        throw new Error("Internal Database Disconnect");
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
        if (error.code === '23505') { // unique_violation postgres code
            throw new Error("User with this email already exists");
        }
        throw new Error("Internal Database Error");
    }
}

export async function updateUserRole(email: string, role: string): Promise<void> {
    try {
        const queryText = `
            UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
            WHERE email = $2;
        `;
        await pool.query(queryText, [role, email.toLowerCase()]);
    } catch (error) {
        console.error("Failed updating user role:", error);
        throw new Error("Internal Database Error");
    }
}

export async function deleteUserByEmail(email: string): Promise<void> {
    try {
        const queryText = `
            DELETE FROM users WHERE email = $1;
        `;
        await pool.query(queryText, [email.toLowerCase()]);
    } catch (error) {
        console.error("Failed deleting user:", error);
        throw new Error("Internal Database Error");
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
        const { rows } = await client.query(queryText, [type, itemSku, itemName, requestedQty, requestedBy.toLowerCase()]);
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

export async function updateStockRequestStatus(id: number, status: string): Promise<void> {
    try {
        await pool.query("UPDATE stock_requests SET status = $1 WHERE id = $2", [status, id]);
    } catch (error) {
        console.error("Failed updating stock request status:", error);
        throw new Error("Internal Database Error");
    }
}

// --- Notifications ---

export async function createNotification(message: string, type: string, relatedId: number | null = null): Promise<void> {
    try {
        await pool.query(`
            INSERT INTO notifications (message, type, related_id)
            VALUES ($1, $2, $3)
        `, [message, type, relatedId]);
    } catch (error) {
        console.error("Failed creating notification:", error);
    }
}

export async function getUnreadNotifications(): Promise<Notification[]> {
    try {
        const { rows } = await pool.query("SELECT * FROM notifications WHERE is_read = FALSE ORDER BY created_at DESC");
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
