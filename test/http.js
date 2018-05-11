import '@babel/polyfill';

import test from 'ava';
import request from 'supertest';
import server from './../src/server/server';
import place from './../src/server/models/place';
import sequelize from './../src/server/sequelize';

test.before('server starts', async t => {
	await sequelize.sync(); // Just in case
	t.is(server.http(), null);
	await server.listen(7867);
	t.not(server.http(), null);

	t.context = {
		place: await place.create({name: 'observation testing'})
	};
});

test('server should not start when it\'s running', t => {
	t.not(server.http(), null);
	t.throws(() => server.listen(7867), Error);
});

test('router should not be empty', t => {
	t.not(server.router().routes().length, 0);
});

test('creating place dupe test', async t => {
	let res = await request(server.http())
		.post('/places/new')
		.send({name: 'this is a weird name'});

	t.is(res.status, 201);
	t.is(res.body.name, 'this is a weird name');
	t.is(res.body.latitude, null);
	t.is(res.body.longitude, null);

	res = await request(server.http())
		.post('/places/new')
		.send({name: 'this is a weird name'});

	t.is(res.status, 409);
	t.is(res.body.code, 'ERR_PLACE_CREATE_CONFLICT_NAME');
});

test('creating valid place', async t => {
	const res = await request(server.http())
		.post('/places/new')
		.send({name: 'this name should not exist before', latitude: 25});

	t.is(res.status, 400);
	t.is(res.body.code, 'ERR_PLACE_CREATE_ONLY_ONE_LAT_LON_PRESENT');
});

test('creating observation validation faiture tests', async t => {
	const placeId = t.context.place.id;

	let res = await request(server.http())
		.post('/observations/new')
		.send({});

	t.deepEqual(res.body, {
		error: 'CLIENT_ERROR',
		code: 'ERR_OBSERVATION_CREATE_VALIDATION',
		userFriendlyMessages: ['notNull Violation: observation.temperature cannot be null,', 'notNull Violation: observation.place cannot be null'],
		http: '400 Bad Request'
	});

	res = await request(server.http())
		.post('/observations/new')
		.send({place: 25000, temperature: 25});

	t.deepEqual(res.body, {
		error: 'CLIENT_ERROR',
		code: 'ERR_OBSERVATION_CREATE_VALIDATION',
		userFriendlyMessages: ['Validation error: could not find a place with specified id'],
		http: '400 Bad Request'
	});

	res = await request(server.http())
		.post('/observations/new')
		.send({place: placeId, temperature: 250});

	t.deepEqual(res.body, {
		error: 'CLIENT_ERROR',
		code: 'ERR_OBSERVATION_CREATE_VALIDATION',
		userFriendlyMessages: ['Validation error: Validation max on temperature failed'],
		http: '400 Bad Request'
	});
});

test('creating observation validation pass', async t => {
	const placeId = t.context.place.id;

	const res = await request(server.http())
		.post('/observations/new')
		.send({place: placeId, temperature: 25});

	if (res.status !== 201) {
		console.log('faiture', res);
	}

	t.is(res.status, 201);
	t.is(res.body.temperature, 25);
});

test('creating observation with an invalid place message translation test', async t => {
	const res = await request(server.http())
		.post('/observations/new')
		.send({place: 99999, temperature: 0});

		t.deepEqual(res.body, {
			error: 'CLIENT_ERROR',
			code: 'ERR_OBSERVATION_CREATE_VALIDATION',
			userFriendlyMessages: ['Validation error: could not find a place with specified id'],
			http: '400 Bad Request'
		});
});

test
	.after
	.always('server stops', async t => {
		t.not(server.http(), null);
		await server.stop();
		t.is(server.http(), null);
	});
