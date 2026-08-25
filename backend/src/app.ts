import './config/env.js'
import express from 'express';
import cors from 'cors';
import apiRouter from './routers/api.routes.js'

const app = express();

app.use(cors({
	origin: process.env.FRONT_URL,
	credentials: true
}));

app.use('/api', apiRouter);

export default app;