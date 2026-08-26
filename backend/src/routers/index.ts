import express from 'express';
import recipeRouter from './recipe.routes.js';

const router = express.Router();

router.get('/', (_req, res) => {
	res.status(200).json({
		success: true,
		message: "Welcome to yum-yard API server!!"
	})
})

router.get('/health', (_req, res) => {
	res.status(200).json({
		status: "ok"
	})
})

router.use('/recipes', recipeRouter);

export default router;