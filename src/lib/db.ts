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
