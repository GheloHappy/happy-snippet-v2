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
    password: string;
}


export const insertGoogleUser = async (data: GoogleUser): Promise<{ msg: string, status: boolean }> => { //to update to auth_provider table
    try {
        const parameters = [
            data.google_user_id,
            data.email,
            data.name,
            data.profile_picture_url,
            data.created_at || new Date(),
            data.updated_at || new Date()
        ];
        const query = 'INSERT INTO google_users (google_user_id, email, name, profile_picture_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING google_user_id';

        const result = await executeQuery(query, parameters);

        if (result.rows.length > 0) {
            return ({ msg: `User ${data.name} is successfully registered`, status: true });
        } else {
            return ({ msg: 'User registration failed', status: false });
        }
    } catch (e) {
        console.error('Error during insert:', e);
        return ({ msg: 'An error occurred during registration', status: false });
    }
};

export const insertUser = async (data: User) => {
    const verify = await verifyUser({ username: data.username, email: data.email }, false);

    if (verify.existing) {
        return { msg: verify.msg, status: false };
    }

    try {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const parameters = [data.username, data.email, hashedPassword];
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';

        await executeQuery(query, parameters);

        return { msg: `User ${data.username} is successfully registered`, status: true };
    } catch (err) {
        console.error(err);
        return { msg: `Failed to register user.`, status: false };
    }
}

export const verifyGoogleUser = async (google_id: string): Promise<{ msg: string, exist: boolean }> => {
    try {
        const query = `SELECT * FROM google_users
                       WHERE google_user_id = $1`;

        const result = await executeQuery(query, [google_id]);

        if (result.rows.length > 0) {
            return ({ msg: "User already exists", exist: true });
        }

        return ({ msg: "User does not exist", exist: false });
    } catch (e) {
        console.error('Error during verifyGoogleUser:', e);
        return ({ msg: 'Error during verifyGoogleUser:', exist: false });
    }
}

type AuthCheck = {
    username?: string;
    email?: string;
    password?: string;
}


export const verifyUser = async (
    auth: AuthCheck,
    isSignIn: boolean
): Promise<{ msg: string; existing: boolean; status: boolean; result: any }> => {
    try {
        const query = 'SELECT * FROM users WHERE username = $1 OR email = $2';
        const result = await executeQuery(query, [auth.username, auth.email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            if (isSignIn) {
                if (!auth.password) {
                    return { msg: 'Password is required.', existing: false, status: false, result: [] };
                }

                const isPasswordValid = await bcrypt.compare(auth.password, user.password);

                if (isPasswordValid) {
                    return { msg: 'User is successfully logged in.', existing: false, status: true, result: user };
                }

                return { msg: 'Invalid username or password', existing: false, status: false, result: [] };
            }

            return { msg: 'Email/Username is not available.', existing: true, status: false, result: [] };
        }

        return { msg: 'User does not exist.', existing: false, status: false, result: [] };
    } catch (err) {
        console.error(err);
        return { msg: 'Error verifying user.', existing: false, status: false, result: [] };
    }
};
