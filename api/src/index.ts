import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { PORT } from './utils/constants';
import cookieParser from "cookie-parser";

import authRoute from './routes/auth.route'

const app = express();

app.use(cookieParser());

const allowedOrigins = ['https://home-fetest.ghelonico.site', 'https://work-fe2.ghelonico.site'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked for origin: ', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'platform'],
    credentials: true,
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use(`/api/auth`, authRoute)

app.get('/', (req: Request, res: Response) => {
    return res.send('If you see this message. API IS WORKING!!');
});

app.listen(PORT, () => {
    console.log(`Server is now running on PORT: ${PORT}`);
});