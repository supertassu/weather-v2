import 'babel-polyfill';

import test from 'ava';
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

test.after.always('server stops', async t => {
	t.not(server.http(), null);
	await server.stop();
	t.is(server.http(), null);
});
