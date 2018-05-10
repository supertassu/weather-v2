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

test
	.after
	.always('server stops', async t => {
		t.not(server.http(), null);
		await server.stop();
		t.is(server.http(), null);
	});
