
import { getClient } from "./client.js";

const createTables = async (client: ReturnType<typeof getClient> extends Promise<infer U> ? U : never) => {
    const tables = [
        {
            name: "users",
            columns: [
                { name: "id", type: "serial PRIMARY KEY", isNullable: false },
                { name: "email", type: "TEXT UNIQUE NOT NULL" },
                { name: "name", type: "TEXT NOT NULL" },
                { name: "auth", type: "INTEGER NOT NULL" },
                { name: "auth_description", type: "TEXT NOT NULL" },
            ],
        },
        {
            name: "auth_providers",
            columns: [
                { name: "id", type: "serial PRIMARY KEY", isNullable: false },
                { name: "user_id", type: "INTEGER NOT NULL REFERENCES users(id)" }, // FK to users.id
                { name: "provider", type: "TEXT NOT NULL" }, // 'local', 'google', 'facebook'
                { name: "provider_user_id", type: "TEXT" }, // external ID
                { name: "password", type: "TEXT" }, // only for 'local'
                { name: "profile_picture_url", type: "TEXT" },
                { name: "created_at", type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
                { name: "updated_at", type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
            ],
        },
    ];


    for (const table of tables) {
        const columnsDefinition = table.columns
            .map((col) => `${col.name} ${col.type}`)
            .join(", ");

        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsDefinition})`;
        await client.query(createTableQuery);
        console.log(`Table ${table.name} created successfully`);

    };

    //includes constraints
    // for (const table of tables) {
    //     const columnsDefinition = table.columns
    //         .map((col) => `${col.name} ${col.type}`)
    //         .join(", ");

    //     const constraintsDefinition = table.constraints
    //         ? `, ${table.constraints.join(", ")}`
    //         : "";

    //     const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsDefinition}${constraintsDefinition})`;

    //     await client.query(createTableQuery);
    //     console.log(`Table ${table.name} created successfully`);
    // }

    const createViews = async (client: ReturnType<typeof getClient> extends Promise<infer U> ? U : never) => {
        const views: { name: string; query: string }[] = [
            // Add your views here, e.g.
            // {
            //   name: "user_information",
            //   query: `CREATE OR REPLACE VIEW user_information AS ...`,
            // },
        ];

        for (const view of views) {
            await client.query(view.query);
            console.log(`View ${view.name} created successfully`);
        }
    };

    const runMigration = async () => {
        const client = await getClient();

        try {
            await client.query("BEGIN");
            console.log("Transaction started");

            await createTables(client);
            await createViews(client);

            await client.query("COMMIT");
            console.log("Transaction committed");
            console.log("✅ Migration completed");
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Transaction rolled back due to error:", error);
            console.error("❌ Migration failed");
        } finally {
            // Since this is a single client, close connection if this script is a one-off
            await client.end();
            console.log("Client connection closed");
        }
    };

    runMigration();
