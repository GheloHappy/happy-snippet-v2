import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { PORT } from './utils/constants';
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());


const allowedOrigins = ['http://localhost:6669','https://home-fetest.ghelo.site'];

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
    allowedHeaders: ['Content-Type', 'Authorization','platform'],
    credentials: true,
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.get('/', (req: Request, res: Response) => {
    return res.send('If you see this message. API IS WORKING!!');
});

app.listen(PORT, () => {
    console.log(`Server is now running on PORT: ${PORT}`);
});