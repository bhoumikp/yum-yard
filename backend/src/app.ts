import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import apiRouter from './routers/index.js'

const app = express();

app.use(cors({
	origin: process.env.FRONT_URL,
	credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1', apiRouter);

export default app;