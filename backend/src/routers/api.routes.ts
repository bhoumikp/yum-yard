import express from 'express';

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


export default router;