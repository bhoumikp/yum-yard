import express from 'express';
import { db } from '../prisma/db.js';
import { or } from '@prisma/orm-postgres/orm-client';

const router = express.Router();

router.get('/', async (req, res, next) => {
	const pageValue = Number(req.query.page);
	const limitValue = Number(req.query.limit);

	const page = Number.isInteger(pageValue) && pageValue > 0
		? pageValue
		: 1;

	const limit = Number.isInteger(limitValue) && limitValue > 0
		? Math.min(limitValue, 50)
		: 12;
		
	const skip = (page -1) * limit;

	const search = typeof req.query.search === 'string'
			? req.query.search.trim()
			: '';

	const category = typeof req.query.category === 'string'
			? req.query.category.trim()
			: '';

	const cuisine = typeof req.query.cuisine === 'string'
			? req.query.cuisine.trim()
			: '';

	const type = typeof req.query.type === 'string'
			? req.query.type.trim()
			: '';

	const difficulty = typeof req.query.difficulty === 'string'
			? req.query.difficulty.trim()
			: '';

	const maxCookingTimeValue = Number(req.query.maxCookingTime);

	const maxCookingTime = Number.isInteger(maxCookingTimeValue) && maxCookingTimeValue > 0
			? maxCookingTimeValue
			: null;

	try {
		let query = db.orm.public.Recipe
			.where({ status: 'PUBLISHED' });

		if (search) {
			query = query.where((r) =>
				or(
					r.title.ilike(`%${search}%`),
					r.description.ilike(`%${search}%`),
				),
			);
		}

		if (category) {
			query = query.where({category});
		}

		if (cuisine) {
			query = query.where({cuisine});
		}

		if (type) {
			query = query.where({type});
		}

		if (difficulty) {
			query = query.where({difficulty});
		}

		if (maxCookingTime !== null) {
			query = query.where((r) => r.cookingTimeMinutes.lte(maxCookingTime));
		}

		const recipes = await query
			.orderBy((r) => r.createdAt.desc())
			.skip(skip)
			.take(limit)
			.all();

		const total = await query.aggregate((r) => ({count: r.count()}))

		const totalPages = Math.ceil(total.count / limit);

		res.status(200).json({
			success: true,
			data: recipes,
			pagination: {
				page,
				limit,
				total: total.count,
				totalPages,
			}
		})
	} catch(err) {
		next(err);
	}
});

export default router;