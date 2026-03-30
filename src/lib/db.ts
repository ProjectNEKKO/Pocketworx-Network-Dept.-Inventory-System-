import bcrypt from "bcryptjs";

// We create a mock database with hashed passwords to demonstrate realistic database validation
// The universally generic password configured safely for mock environments: "packetworx"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("packetworx", 10);
const COADMIN_PASSWORD_HASH = bcrypt.hashSync("packetworx", 10);

export const usersTable = [
    {
        id: 1,
        email: "admin@packetworx.com",
        password_hash: ADMIN_PASSWORD_HASH,
        role: "admin" as const,
    },
    {
        id: 2,
        email: "co-admin@packetworx.com",
        password_hash: COADMIN_PASSWORD_HASH,
        role: "co-admin" as const,
    },
    {
        id: 3,
        email: "user@packetworx.com",
        password_hash: bcrypt.hashSync("packetworx", 10),
        role: "user" as const,
    },
];

export async function getUserByEmail(email: string) {
    // Simulate DB query latency
    await new Promise((resolve) => setTimeout(resolve, 300));
    return usersTable.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}
