import express, { Request, Response } from 'express';
import cors from 'cors';

// import usersRoute from './routes/users.route';
// import snippetRoute from './routes/snippet.route';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['https://snippet.ghelo.site'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(usersRoute);
// app.use(snippetRoute);

app.get('/', (req: Request, res: Response) => {
    return res.send('If you see this message. API IS WORKING!!');
});

app.listen(PORT, () => {
    console.log(`Server is now running on PORT: ${PORT}`);
});
