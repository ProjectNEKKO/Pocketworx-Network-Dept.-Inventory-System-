import pg from 'pg';
import * as dotenv from 'dotenv';
const { Pool } = pg;

dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const componentsSeed = [
    { name: "10ft RSC Pipe 1.5inch", sku: "PIPE-RSC-10FT-15", stock: 50, min: 100, category: "Hardware" },
    { name: "2-Pin Male Plug", sku: "ELEC-2PIN-M", stock: 200, min: 100, category: "Accessories" },
    { name: "2 hole C Clamp 1-1/2' RGD", sku: "HW-CCLAMP-15", stock: 30, min: 100, category: "Accessories" },
    { name: "32cm SMA", sku: "CBL-SMA-32", stock: 50, min: 100, category: "Cable" },
    { name: "32cm SMA Male to Female", sku: "CBL-SMA-MF-32", stock: 30, min: 100, category: "Cable" },
    { name: "915Mhz Lora Antenna 3.8dBi", sku: "ANT-LORA-915-3.8", stock: 50, min: 100, category: "RF" },
    { name: "915Mhz Lora Antenna 3dBi", sku: "ANT-LORA-915", stock: 50, min: 100, category: "RF" },
    { name: "AC Outlet", sku: "ELEC-AC-OUTLET", stock: 50, min: 100, category: "Electrical" },
    { name: "ADA Fruit for GSM Antenna", sku: "ADA-FRUIT-GSM", stock: 50, min: 100, category: "Enclosure" },
    { name: "ADA Fruit Weatherproof Enclosure", sku: "ADA-FRUIT", stock: 75, min: 100, category: "Connector" },
    { name: "Antenna Clamp", sku: "ANT-CLAMP", stock: 40, min: 100, category: "Hardware" },
    { name: "AWG Gauge #12 TTHN", sku: "WIRE-12", stock: 40, min: 100, category: "Accessories" },
    { name: "AWG Gauge #16 Duplex Flat Cord", sku: "WIRE-16-DUPLEX", stock: 50, min: 100, category: "Electrical" },
    { name: "CAT5e Cable", sku: "CBL-CAT5E", stock: 120, min: 200, category: "Networking" },
    { name: "Enclosure Dimension 168X149 mm", sku: "DIM-168-149", stock: 10, min: 50, category: "Enclosure" },
    { name: "Extension Bracket", sku: "BRKT-EXT", stock: 50, min: 100, category: "Hardware" },
    { name: "Gauge 12 AC Wire (Black)", sku: "WIRE-12-BLK", stock: 200, min: 200, category: "Accessories" },
    { name: "Gauge 12 AC Wire (Red)", sku: "WIRE-12-RED", stock: 200, min: 200, category: "Accessories" },
    { name: "Generic L- type Bracket", sku: "BRACKET-L", stock: 40, min: 100, category: "Accessories" },
    { name: "M3x20mm Self-Tapping Counter Sunk Head Black Screw", sku: "HW-M3X20-SCREW", stock: 50, min: 100, category: "Hardware" },
    { name: "M3x33mm Self-Tapping Counter Sunk Head Black Screw", sku: "HW-M3X33-SCREW", stock: 50, min: 100, category: "Hardware" },
    { name: "M5 Bolts and Nuts", sku: "HW-M5-BN", stock: 200, min: 300, category: "Hardware" },
    { name: "M5 Louver Vent with Nut", sku: "M5-VENT-NUT", stock: 90, min: 100, category: "Hardware" },
    { name: "M6 Bolts and Nuts", sku: "HW-M6-BN", stock: 180, min: 200, category: "Accessories" },
    { name: "M8 Tox and Screw", sku: "HW-M8-TOX", stock: 150, min: 300, category: "Hardware" },
    { name: "N Type Female Plug to SMA Plug Male 32cm", sku: "CBL-NF-SMAM-32", stock: 60, min: 100, category: "Cable" },
    { name: "NEMA R3 Enclosure", sku: "ENCL-NEMA-R3", stock: 50, min: 100, category: "Enclosure" },
    { name: "Outlet 4- Gang (For Extension)", sku: "ELEC-OUT-4G", stock: 25, min: 100, category: "Accessories" },
    { name: "Paddle Antenna", sku: "ANT-PADDLE", stock: 35, min: 100, category: "RF" },
    { name: "Padlock (Combination)", sku: "HW-PADLOCK-COMB", stock: 50, min: 100, category: "Hardware" },
    { name: "Panasonic Outlet (Receptacle)", sku: "ELEC-PAN-OUT", stock: 40, min: 100, category: "Accessories" },
    { name: "Plastic Molding (5/8'')", sku: "HW-MOLD-58", stock: 60, min: 100, category: "Accessories" },
    { name: "PoE Adaptor 24v ", sku: "POE-24V", stock: 40, min: 100, category: "Networking" },
    { name: "POE Splitter", sku: "NET-POE-SPLIT", stock: 50, min: 100, category: "Networking" },
    { name: "RG316 Bulk Head", sku: "RG316-BULK-HEAD", stock: 40, min: 100, category: "Cable" },
    { name: "RJ45 CAT6 Lan Cable (White)", sku: "CBL-CAT6-WHT", stock: 100, min: 200, category: "Networking" },
    { name: "RJ45 Connector Passthrough", sku: "RJ45-PASS-THROUGH", stock: 40, min: 100, category: "Networking" },
    { name: "Shieldcon LQT Galvanized Flexible Conduit (Soft) 1/2\"x50m Roll", sku: "HW-FLEX-COND-12", stock: 50, min: 100, category: "Hardware" },
    { name: "Tofu Heatsink (White)", sku: "HS-TOFU-WHT", stock: 25, min: 100, category: "Hardware" },
    { name: "U BOLTS 1 1/2 \"", sku: "HW-UBOLT-15", stock: 45, min: 100, category: "Accessories" },
];

const gatewaysSeed = [
    { id: "Gateway 915 Outdoor", sku: "GW-915-OA", location: "PWX IoT Hub", quantity: 1 },
    { id: "Gateway 868 Outdoor", sku: "GW-868-OA", location: "PWX IoT Hub", quantity: 2 },
    { id: "Gateway 915 Indoor", sku: "GW-915-IA", location: "PWX IoT Hub", quantity: 1 },
    { id: "Gateway 868 Indoor", sku: "GW-868-IA", location: "PWX IoT Hub", quantity: 5 },
    { id: "Femto Outdoor", sku: "GW-FM-OA", location: "PWX IoT Hub", quantity: 3 },
    { id: "Gateway 915 Outdoor", sku: "GW-915-OB", location: "Jenny's", quantity: 2 },
    { id: "Gateway 868 Outdoor", sku: "GW-868-OB", location: "Jenny's", quantity: 1 },
    { id: "Gateway 915 Indoor", sku: "GW-915-IB", location: "Jenny's", quantity: 3 },
    { id: "Gateway 868 Indoor", sku: "GW-868-IB", location: "Jenny's", quantity: 2 },
    { id: "Femto Outdoor", sku: "GW-FM-OB", location: "Jenny's", quantity: 1 },
];

async function migrate() {
    try {
        console.log("Starting Migration...");

        // 1. Seed Components
        console.log("Seeding Components...");
        for (const item of componentsSeed) {
            // Seed for both warehouses
            await pool.query(
                "INSERT INTO inventory_components (sku, name, stock, min_stock, category, warehouse) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (sku, warehouse) DO UPDATE SET stock = EXCLUDED.stock",
                [item.sku, item.name, item.stock, item.min, item.category, "PWX IoT Hub"]
            );
            await pool.query(
                "INSERT INTO inventory_components (sku, name, stock, min_stock, category, warehouse) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (sku, warehouse) DO UPDATE SET stock = EXCLUDED.stock",
                [item.sku, item.name, item.stock, item.min, item.category, "Jenny's"]
            );
        }

        // 2. Seed Gateways
        console.log("Seeding Gateways...");
        for (const gw of gatewaysSeed) {
            await pool.query(
                "INSERT INTO gateways (name, sku, location, quantity) VALUES ($1, $2, $3, $4) ON CONFLICT (sku) DO NOTHING",
                [gw.id, gw.sku, gw.location, gw.quantity]
            );
        }

        console.log("Migration Successful!");
    } catch (err) {
        console.error("Migration Failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
