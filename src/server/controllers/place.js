import place from '../models/place';

const query = async ctx => {
	let options = {};

	if (Object.prototype.hasOwnProperty.call(ctx, 'params') && Object.prototype.hasOwnProperty.call(ctx.params, 'id')) {
		options = {
			where: {
				id: ctx.params.id
			}
		};
	}

	const result = await place.findAll(options);
	const places = await Promise.all(result.map(result => result.toJSON()));

	const response = {
		results: places
	};

	ctx.body = response;
};

const create = async ctx => {
	const params = ctx.request.body;

	if (!Object.prototype.hasOwnProperty.call(params, 'name')) {
		ctx.body = {
			error: 'CLIENT_ERROR',
			code: 'ERR_PLACE_CREATE_MISSING_NAME',
			http: '400 Bad Request'
		};
		ctx.status = 400;
	}

	let result = null;

	try {
		result = await place.create(params);
	} catch (e) {
		if (e.message === 'A place with the specified name already exists.') {
			ctx.body = {
				error: 'CLIENT_ERROR',
				code: 'ERR_PLACE_CREATE_CONFLICT_NAME',
				http: '409 Conflict'
			};
			ctx.status = 409;
		} else if (e.message === 'Validation error: Require either both latitude and longitude or neither') {
			ctx.body = {
				error: 'CLIENT_ERROR',
				code: 'ERR_PLACE_CREATE_ONLY_ONE_LAT_LON_PRESENT',
				userFriendlyMessage: e.message,
				http: '400 Bad Request'
			};
			ctx.status = 400;
		} else if (e.message.indexOf('Validation error') !== -1 || e.message.indexOf('notNull Violation') !== -1) {
			ctx.body = {
				error: 'CLIENT_ERROR',
				code: 'ERR_PLACE_CREATE_VALIDATION_OTHER',
				userFriendlyMessage: e.message,
				http: '400 Bad Request'
			};
			ctx.status = 400;
		} else {
			ctx.body = {
				error: 'SERVER_ERROR',
				http: '500 International Server Error'
			};

			ctx.status = 500;
			throw e;
		}
		return;
	}

	ctx.body = result.toJSON();
	ctx.status = 201;
};

export default {
	query,
	create
};
