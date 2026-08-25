import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: "Welcome to yum-yard API server!!"
	})
})

export default router;