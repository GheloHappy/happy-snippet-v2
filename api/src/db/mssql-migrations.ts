import { getPool } from "src/db";

interface TableColumn {
  name: string;
  type: string;
  isNullable: boolean;
  default?: string | number | boolean;
}

interface TableDefinition {
  name: string;
  columns: TableColumn[];
}

interface ViewDefinition {
  name: string;
  query: string;
}

interface IndexDefinition {
  table: string;
  name: string;
  columns: string[];
  isUnique?: boolean;
}

const tables: TableDefinition[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "INT IDENTITY(1,1) PRIMARY KEY", isNullable: false },
      { name: "username", type: "NVARCHAR(50) UNIQUE", isNullable: false },
      { name: "password", type: "NVARCHAR(255)", isNullable: false },
      { name: "name", type: "NVARCHAR(100)", isNullable: false },
      { name: "department", type: "NVARCHAR(50)", isNullable: false },
      {
        name: "role",
        type: "NVARCHAR(20) CHECK (role IN ('USER','ADMIN'))",
        isNullable: false,
      },
      {
        name: "is_active",
        type: "BIT",
        isNullable: false,
        default: 1,
      },
      {
        name: "created_at",
        type: "DATETIME",
        isNullable: false,
        default: "GETDATE()",
      },
    ],
  },

];

const indexes: IndexDefinition[] = [
  // {
  //   table: "bank_transactions",
  //   name: "uq_bank_transactions_unique",
  //   columns: [
  //     "bank_name",
  //     "account_number",
  //     "posting_date",
  //     "description",
  //     "debit",
  //     "credit",
  //     "balance",
  //   ],
  //   isUnique: true,
  // },
];

const views: ViewDefinition[] = [];

/* =========================
   TABLE FUNCTIONS
========================= */

const doesTableExist = async (tableName: string): Promise<boolean> => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = N'${tableName}'
    `);

    return result.recordset.length > 0;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
};

const createTable = async (
  tableName: string,
  columns: TableColumn[],
): Promise<void> => {
  try {
    const pool = await getPool();
    const request = pool.request();

    const columnsDefinition = columns
      .map((col) => {
        const nullable = col.isNullable ? "NULL" : "NOT NULL";

        let defaultValue = "";

        if (col.default !== undefined) {
          if (
            typeof col.default === "string" &&
            col.default.toUpperCase() === "GETDATE()"
          ) {
            defaultValue = ` DEFAULT GETDATE()`;
          } else if (typeof col.default === "string") {
            defaultValue = ` DEFAULT '${col.default}'`;
          } else if (typeof col.default === "boolean") {
            defaultValue = ` DEFAULT ${col.default ? 1 : 0}`;
          } else {
            defaultValue = ` DEFAULT ${col.default}`;
          }
        }

        return `${col.name} ${col.type}${defaultValue} ${nullable}`;
      })
      .join(", ");

    const query = `
      CREATE TABLE ${tableName} (
        ${columnsDefinition}
      )
    `;

    await request.query(query);

    console.log(`✅ Table ${tableName} created`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error);
  }
};

const createTableIfNotExists = async (
  tableName: string,
  columns: TableColumn[],
) => {
  const exists = await doesTableExist(tableName);

  if (!exists) {
    await createTable(tableName, columns);
  } else {
    console.log(`ℹ️ Table ${tableName} already exists`);
  }
};

/* =========================
   INDEX FUNCTIONS
========================= */

const createIndexIfNotExists = async (
  table: string,
  name: string,
  columns: string[],
  isUnique: boolean = false,
) => {
  try {
    const pool = await getPool();
    const request = pool.request();

    const columnList = columns.join(", ");
    const unique = isUnique ? "UNIQUE" : "";

    const query = `
      IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE name = '${name}'
        AND object_id = OBJECT_ID('${table}')
      )
      BEGIN
        CREATE ${unique} INDEX ${name}
        ON ${table} (${columnList})
      END
    `;

    await request.query(query);

    console.log(`✅ Index ${name} created`);
  } catch (error) {
    console.error(`❌ Error creating index ${name}:`, error);
  }
};

/* =========================
   VIEW FUNCTIONS
========================= */

const doesViewExist = async (viewName: string): Promise<boolean> => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.VIEWS
      WHERE TABLE_NAME = N'${viewName}'
    `);

    return result.recordset.length > 0;
  } catch (error) {
    console.error(`Error checking view ${viewName}:`, error);
    return false;
  }
};

const createView = async (viewName: string, query: string) => {
  try {
    const pool = await getPool();
    const request = pool.request();

    const fullName = `dbo.${viewName}`;

    await request.query(`
      IF OBJECT_ID('${fullName}', 'V') IS NOT NULL
        DROP VIEW ${fullName};
    `);

    const escapedQuery = query.replace(/'/g, "''");

    await request.query(`
      EXEC('CREATE VIEW ${fullName} AS ${escapedQuery}')
    `);

    console.log(`✅ View ${viewName} created`);
  } catch (error) {
    console.error(`❌ Error creating view ${viewName}:`, error);
  }
};

const createViewIfNotExists = async (
  viewName: string,
  query: string,
) => {
  const exists = await doesViewExist(viewName);

  if (!exists) {
    await createView(viewName, query);
  } else {
    console.log(`ℹ️ View ${viewName} already exists`);
  }
};

/* =========================
   MIGRATION RUNNER
========================= */

const runMigration = async () => {
  console.log(`\n🔧 Running migration...`);

  for (const table of tables) {
    await createTableIfNotExists(table.name, table.columns);
  }

  for (const index of indexes) {
    await createIndexIfNotExists(
      index.table,
      index.name,
      index.columns,
      index.isUnique,
    );
  }

  for (const view of views) {
    await createViewIfNotExists(view.name, view.query);
  }

  //Insert Defaults
  // const pool = await getPool();
  //
  // await pool.request().query(`
  //   IF NOT EXISTS (SELECT 1 FROM prefix_lists)
  //   BEGIN
  //     INSERT INTO prefix_lists (prefix, description)
  //     VALUES
  //       ('B2B', NULL),
  //       ('SRA', NULL),
  //       ('REG', NULL),
  //       ('DDT', NULL),
  //       ('ICT', NULL),
  //       ('OBT', NULL),
  //       ('OSD', NULL),
  //       ('OTH', NULL);
  //   END
  // `);
  //
  // await pool.close();
  //
  console.log(`✅ Migration completed`);
};

/* =========================
   EXECUTE
========================= */

(async () => {
  await runMigration();
})();
