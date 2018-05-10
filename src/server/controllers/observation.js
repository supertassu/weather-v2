import observation from '../models/observation';

const query = async ctx => {
	let options = {};

	if (Object.prototype.hasOwnProperty.call(ctx, 'params') && Object.prototype.hasOwnProperty.call(ctx.params, 'place')) {
		options = {
			where: {
				place: ctx.params.place
			}
		};
	}

	const result = await observation.findAll(options);
	const places = await Promise.all(result.map(result => result.toJSON()));

	const response = {
		results: places
	};

	ctx.body = response;
};

const filterMsg = async input => {
	const output = [];

	await input.forEach(element => {
		if (element === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
			element = 'Validation error: could not find a place with specified id';
		}

		output.push(element);
	});

	return output;
};

const create = async ctx => {
	const params = ctx.request.body;

	if (!Object.prototype.hasOwnProperty.call(params, 'name')) {
		ctx.body = {
			error: 'CLIENT_ERROR',
			code: 'ERR_OBSERVATION_CREATE_MISSING_NAME',
			http: '400 Bad Request'
		};
		ctx.status = 400;
	}

	let result = null;

	try {
		result = await observation.create(params);
	} catch (e) {
		if (e.message.indexOf('Validation error') === -1 && e.message.indexOf('notNull Violation') === -1 && e.message.indexOf('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') === -1) {
			ctx.body = {
				error: 'SERVER_ERROR',
				http: '500 International Server Error'
			};

			ctx.status = 500;
			throw e;
		} else {
			ctx.body = {
				error: 'CLIENT_ERROR',
				code: 'ERR_OBSERVATION_CREATE_VALIDATION',
				userFriendlyMessages: await filterMsg(e.message.split('\n')),
				http: '400 Bad Request'
			};
			ctx.status = 400;
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
