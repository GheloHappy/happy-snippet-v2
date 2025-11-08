import bcrypt from "bcryptjs";
import { getClient } from "src/db/client";

// --- Utility: Execute Query ---
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

// --- Types ---
export type User = {
    id?: number;
    username?: string;
    email: string;
    name?: string;
    auth: number; // e.g. 0 = local, 1 = google, etc.
    authDescription: string; // 'local' | 'google' | 'facebook'
    password?: string;
    providerUserId?: string;
    profilePictureUrl?: string;
    createdAt?: string;
    updatedAt?: string;
};

// --- Check if Email Exists ---
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

// --- Verify Login (Local Only) ---
export const verifyLogin = async (
    email: string,
    password: string
): Promise<User | null> => {
    try {
        const result = await executeQuery(
            `
      SELECT u.id, u.email, u.name, u.auth, u.auth_description,
             ap.password, ap.provider, ap.provider_user_id, ap.profile_picture_url
      FROM users u
      JOIN auth_providers ap ON u.id = ap.user_id
      WHERE u.email = $1
    `,
            [email]
        );

        const user = result.rows[0];
        if (!user) return null;

        // Only check password for local users
        if (user.provider === "local") {
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return null;
        }

        delete user.password;
        return user;
    } catch (error) {
        console.error("VerifyLogin Error:", error);
        return null;
    }
};

// --- Insert User (Handles Local & Social) ---
interface InsertUserResponse {
    msg: string;
    success: boolean;
}

export const insertUser = async (data: User): Promise<InsertUserResponse> => {
    try {
        const taken = await isUsernameTaken(data.email);
        if (taken) return { msg: "User already exists", success: false };

        // Step 1: Insert into `users`
        const insertUserQuery = `
      INSERT INTO users (email, name, auth, auth_description)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
        const userResult = await executeQuery(insertUserQuery, [
            data.email,
            data.name || "",
            data.auth,
            data.authDescription,
        ]);

        if (userResult.rows.length === 0)
            return { msg: "Creating user failed", success: false };

        const userId = userResult.rows[0].id;

        // Step 2: Insert into `auth_providers`
        let provider = "local";
        let password: string | null = null;
        let providerUserId: string | null = null;
        let profilePictureUrl: string | null = null;
        let createdAt: string = new Date().toISOString();
        let updatedAt: string = new Date().toISOString();

        if (data.authDescription === "local") {
            provider = "local";
            if (data.password) {
                const salt = await bcrypt.genSalt(12);
                password = await bcrypt.hash(data.password, salt);
            }
        } else {
            provider = data.authDescription; // e.g. 'google'
            providerUserId = data.providerUserId || null;
            profilePictureUrl = data.profilePictureUrl || null;
            createdAt = data.createdAt || new Date().toISOString();
            updatedAt = data.updatedAt || new Date().toISOString();
        }

        const insertAuthQuery = `
      INSERT INTO auth_providers (user_id, provider, provider_user_id, password, profile_picture_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
        await executeQuery(insertAuthQuery, [
            userId,
            provider,
            providerUserId,
            password,
            profilePictureUrl,
            createdAt,
            updatedAt,
        ]);

        return { msg: "User created successfully", success: true };
    } catch (error) {
        console.error("InsertUser Error:", error);
        return { msg: "An error occurred during user creation", success: false };
    }
};


export const getUsersInfoById = async (id: number): Promise<User | null> => {
  try { //ua.contact missing
    const query = `SELECT u.id, u.email, u.name, u.auth, u.auth_description, ap.provider, ap.provider_user_id, ap.profile_picture_url
       FROM users u 
       JOIN auth_providers ap ON u.id = ap.user_id WHERE u.id = $1`;
    const result = await executeQuery(query, [id]);

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("GetUserInfoById Error:", error);
    return null;
  }
};
