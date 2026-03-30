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
    email: string;
    password_hash: string;
    role: 'admin' | 'co-admin' | 'user';
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
            SELECT id, email, password_hash, role
            FROM users
            WHERE email = $1;
        `;
        
        const { rows } = await pool.query(queryText, [email.toLowerCase()]);
        
        return rows[0] || null;
    } catch (error) {
        console.error("[CRITICAL DB EXCEPTION] Failed validating constraints for user lookup:", error);
        // Do not leak inner database schema syntax rules directly if parsing errors occur
        throw new Error("Internal Database Disconnect");
    }
}
