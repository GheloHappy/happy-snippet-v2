import createClient from "../utils/db/client.js";

const createTables = async () => {
    const client = createClient();
    try {
        await client.query('BEGIN');

        const tables = [
            {
                name: 'users',
                columns: [
                    { name: 'id', type: 'serial PRIMARY KEY' },
                    { name: 'username', type: 'VARCHAR NOT NULL' },
                    { name: 'email', type: 'VARCHAR NOT NULL' },
                    { name: 'password', type: 'VARCHAR NOT NULL' },
                ],
            },
            {
                name: 'user_settings',
                columns: [
                    { name: 'id', type: 'serial PRIMARY KEY' },
                    { name: 'user_id', type: 'int' },
                    { name: 'dark_mode', type: 'BOOLEAN NOT NULL' },
                    { name: 'snippet_theme', type: 'VARCHAR NOT NULL' },
                    { name: 'snippet_line_numbers', type: 'BOOLEAN NOT NULL' },
                    { name: 'snippet_wrap_lines', type: 'BOOLEAN NOT NULL' },
                ],
            },
            {
                name: 'user_snippet',
                columns: [
                    { name: 'id', type: 'serial PRIMARY KEY' },
                    { name: "date", type: "VARCHAR NOT NULL", isNullable: false },
                    { name: 'user_id', type: 'int' },
                    { name: 'snippet_title', type: 'VARCHAR NOT NULL' },
                    { name: 'snippet_language', type: 'VARCHAR NOT NULL' },
                    { name: 'snippet_code', type: 'VARCHAR NOT NULL' },
                    { name: 'is_public', type: 'BOOLEAN NOT NULL' },
                ],
            },
            {
                name: 'user_info',
                columns: [
                    { name: 'id', type: 'serial PRIMARY KEY' },
                    { name: 'username', type: 'VARCHAR' },
                    { name: 'display_name', type: 'VARCHAR' },
                    { name: 'first_name', type: 'VARCHAR' },
                    { name: 'last_name', type: 'VARCHAR' },
                    { name: 'birthday', type: 'VARCHAR' },
                    { name: 'backup_email', type: 'VARCHAR' },
                ],
            },
        ];

        for (const table of tables) {
            const columnsDefinition = table.columns
                .map((col) => `${col.name} ${col.type}`)
                .join(', ');

            const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsDefinition})`;

            await client.query(createTableQuery);
            console.log(`Table ${table.name} created successfully`);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating tables:', error);
    } finally {
        client.end();
    }
};

// Views
const createViews = async () => {
    const client = createClient();
    try {
        await client.query('BEGIN');

        const views = [
            {
                name: 'user_information',
                query: `
                CREATE OR REPLACE VIEW user_information AS
                SELECT
                    users.id,
                    users.username,
                    users.email,
                    users.password,
                    user_info.display_name,
                    user_info.first_name,
                    user_info.last_name,
                    user_info.birthday,
                    user_info.backup_email
                FROM
                    public.users
                    LEFT JOIN public.user_info ON user_info.username = users.username
                `,
            },
        ];

        for (const view of views) {
            const createViewQuery = view.query;

            await client.query(createViewQuery);
            console.log(`View ${view.name} created successfully`);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating views:', error);
    } finally {
        client.end();
    }
};

// Run migration
const runMigration = async () => {
    const client = createClient(); // Define client here
    try {
        await createTables();
        await createViews();
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        client.end(); // Close the connection using the client variable
    }
};

runMigration();