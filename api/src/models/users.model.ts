import bcrypt from "node_modules/bcryptjs";
import { getClient } from "src/db/client";

export const executeQuery = async (
    query: string,
    inputParameters: any[] = []
): Promise<{ rows: any[]; rowsAffected: number }> => {
    try {
        const client = await getClient();
        const result = await client.query(query, inputParameters);
        return { rows: result.rows, rowsAffected: result.rowCount ?? 0 };
    } catch (error) {
        console.error("executeQuery error:", error);
        throw error;
    }
};

export type GoogleUser = {
    id: string;
    google_user_id: string;
    email: string;
    name?: string;
    profile_picture_url?: string;
    created_at: string;
    updated_at: string;
}

export type User = {
    username: string;
    email: string;
    auth: string;
    auth_description: string;
    password: string;
}

// --- Username Availability Check ---
export const isUsernameTaken = async (
    email: string,
    excludeId?: number
): Promise<boolean> => {
    let query = `SELECT id FROM users WHERE email = $1`;
    const params: any[] = [email];

    if (excludeId) {
        query += ` AND id != $2`;
        params.push(excludeId);
    }

    const result = await executeQuery(query, params);
    return result.rows.length > 0;
};

// --- Verify Login ---
export const verifyLogin = async (
    email: string,
    password: string
): Promise<User | null> => {
    try {
        const result = await executeQuery(
            // `SELECT u.id, u.email, u.name, u.auth, u.auth_description, u.default_price_class, salesman_code, ap.password
            //  FROM users u
            //  JOIN auth_providers ap ON u.id = ap.user_id
            //  WHERE u.email = $1 AND ap.provider = 'local'`,
            `SELECT u.id, u.email, u.name, u.auth, u.auth_description, u.default_price_class, salesman_code, ap.password, ua.address, ua.city, ua.province, ua.zip_code 
       FROM users u
       JOIN auth_providers ap ON u.id = ap.user_id 
       LEFT JOIN users_address as ua ON u.id = ua.user_id 
       WHERE u.email = $1 AND ap.provider = 'local'`,
            [email]
        );

        const user = result.rows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        delete user.password;
        return user;
    } catch (error) {
        console.error("VerifyLogin Error:", error);
        return null;
    }
};

// --- Insert User ---
interface InsertUserResponse {
    msg: string;
    success: boolean;
}

export const insertUser = async (data: User): Promise<InsertUserResponse> => {
    try {
        const taken = await isUsernameTaken(data.email);
        if (taken) return { msg: "User already exists", success: false };

        // Step 1: Insert into users
        const insertUserQuery = `
      INSERT INTO users (email, name, auth, auth_description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
        const userResult = await executeQuery(insertUserQuery, [
            data.email,
            data.name,
            data.auth,
            data.auth_description
        ]);

        if (userResult.rows.length === 0)
            return { msg: "Creating user failed", success: false };

        const userId = userResult.rows[0].id;

        // Step 2: Insert into auth_providers (local)
        if (data.password) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(data.password, salt);

            const insertAuthQuery = `
        INSERT INTO auth_providers (user_id, provider, provider_user_id, password)
        VALUES ($1, $2, $3, $4)
      `;
            await executeQuery(insertAuthQuery, [userId, "local", userResult.google_user_id, hashedPassword]);
        }
        return { msg: "User created successfully", success: true };
    } catch (error) {
        console.error("InsertUser Error:", error);
        return { msg: "An error occurred during user creation", success: false };
    }
};