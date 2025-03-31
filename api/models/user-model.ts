import createClient from "../utils/db/client.js";
import bcrypt from 'bcryptjs';
import {User} from "../types/user-types.js";
import * as console from "node:console";

type ResultCallback = (result: {
    msg?: string;
    status?: boolean;
    existing?: boolean;
    user_details?: any;
    passed?: boolean;
    success?: boolean
}) => void;

const executeQuery = async (client: any, query: string, inputParameters: any[] = []): Promise<any[]> => {
    try {
        const result = await client.query(query, inputParameters);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const insertUser = async (data: User, result: ResultCallback): Promise<void> => {
    const client = createClient();

    try {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const parameters = [data.username, data.email, hashedPassword];
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';

        await executeQuery(client, query, parameters);
        await insertInitialUserInfo(data.username);

        result({msg: `User ${data.username} is successfully registered`, status: true});
    } catch (err) {
        console.error(err);
    } finally {
        client.end();
    }
}

const insertInitialUserInfo = async (username: string): Promise<void> => {
    const client = createClient();
    const parameters = [username, 'Snippet User'];
    try {
        const query = 'INSERT INTO user_info (username, display_name) VALUES ($1, $2)';
        await executeQuery(client, query, parameters);
    } catch (err) {
        console.error(err);
    } finally {
        client.end();
    }
};

export const verifyUser = async (username: string, isLogin: boolean, result: ResultCallback): Promise<void> => {
    const client = createClient();
    try {
        const query = 'SELECT * FROM user_information WHERE username = $1';

        const queryResult = await executeQuery(client, query, [username]);

        if(queryResult.length > 0) {
            if(isLogin) {
                return (result({ existing: false, user_details: queryResult[0]}))
            }
            return result({ msg: 'User is not available.', existing: true });
        }
        return result({ passed: true })
    } catch (err) {
        console.error(err);
    } finally {
        client.end();
    }
}