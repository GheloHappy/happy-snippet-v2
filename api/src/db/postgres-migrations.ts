import { getClient } from "src/db/postgres-index";

const createTables = async (
  client: ReturnType<typeof getClient> extends Promise<infer U> ? U : never,
) => {
  const tables = [
    {
      name: "users",
      columns: [
        { name: "id", type: "serial PRIMARY KEY" },
        { name: "email", type: "VARCHAR(255) UNIQUE NOT NULL" },
        { name: "name", type: "VARCHAR(255) NOT NULL" },
        { name: "profile_picture_url", type: "TEXT" },
        { name: "status", type: "VARCHAR(50) DEFAULT 'active'" },
        { name: "created_at", type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
      ],
    },
    {
      name: "auth_providers",
      columns: [
        { name: "id", type: "serial PRIMARY KEY" },
        { name: "user_id", type: "INTEGER NOT NULL" },
        { name: "provider", type: "VARCHAR(50) NOT NULL" },
        { name: "provider_user_id", type: "VARCHAR(255)" },
        { name: "password", type: "VARCHAR(255)" },
        { name: "created_at", type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
      ],
      constraints: [
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
        "UNIQUE (provider, provider_user_id)",
        "CHECK (provider IN ('email', 'google', 'facebook', 'github'))",
      ],
    },
  ];

  for (const table of tables) {
    const columnsDefinition = table.columns
      .map((col) => `${col.name} ${col.type}`)
      .join(", ");

    const constraintsDefinition = table.constraints
      ? `, ${table.constraints.join(", ")}`
      : "";

    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsDefinition}${constraintsDefinition})`;

    await client.query(createTableQuery);
    console.log(`Table ${table.name} created successfully`);
  }

  // Create updated_at trigger function
  await client.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create triggers for updated_at columns
  const tablesWithTimestamps = ["users", "auth_providers"];
  for (const tableName of tablesWithTimestamps) {
    await client.query(`
      CREATE OR REPLACE TRIGGER set_${tableName}_updated_at
      BEFORE UPDATE ON ${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log(`Trigger for ${tableName}.updated_at created successfully`);
  }
};

const createViews = async (
  client: ReturnType<typeof getClient> extends Promise<infer U> ? U : never,
) => {
  const views: { name: string; query: string }[] = [];

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
    await client.release();
    console.log("Client connection closed");
  }
};

runMigration();
