import 'babel-polyfill';

import test from 'ava';
import request from 'supertest';
import server from './../src/server/server';

test.before('server starts', async t => {
	t.is(server.http(), null);
	await server.listen(9000);
	t.not(server.http(), null);
});

test('server should not start when it\'s running', t => {
	t.not(server.http(), null);
	t.throws(() => server.listen(9000), Error);
});

test('router should not be empty', t => {
	t.not(server.router().routes().length, 0);
});

test('creating place', async t => {
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

	res = await request(server.http())
		.post('/places/new')
		.send({name: 'this name should not exist before', latitude: 25});

	t.is(res.status, 400);
	t.is(res.body.code, 'ERR_PLACE_CREATE_ONLY_ONE_LAT_LON_PRESENT');
});

test('creating observation', async t => {
	// Creating observation place for testing

	let res = await request(server.http())
		.post('/places/new')
		.send({name: 'observation testing'});

	t.is(res.status, 201);
	t.is(res.body.name, 'observation testing');
	t.is(res.body.latitude, null);
	t.is(res.body.longitude, null);

	const placeId = res.body.id;

	res = await request(server.http())
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
		.send({place: placeId, temperature: 25});

	t.is(res.status, 201);
	t.is(res.body.temperature, 25);
});

test
	.after
	.always('server stops', async t => {
		t.not(server.http(), null);
		await server.stop();
		t.is(server.http(), null);
	});
