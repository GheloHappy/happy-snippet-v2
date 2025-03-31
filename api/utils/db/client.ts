import pkg from 'pg';
const { Client } = pkg;
import { user, password, server, database } from './creds.js';

export default function createClient (){
    const client = new Client({
        host: server,
        user: user,
        port: 5432,
        password: password,
        database: database,
    });

    client.connect();

    return client;
};