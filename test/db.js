import '@babel/polyfill';

import test from 'ava';
import {ValidationError, ForeignKeyConstraintError} from 'sequelize';
import place from '../src/server/models/place';
import observation from '../src/server/models/observation';
import sequelize from './../src/server/sequelize';

test.before('sequelize synchronizes', async t => {
	await sequelize.sync();

	observation.destroy({
		where: {},
		truncate: true
	});

	place.destroy({
		where: {},
		truncate: true
	});

	t.context = {
		place: await place.create({name: 'this place was created in the setup function so you can use it if you want.'})
	};

	t.pass();
});

test('defining a duplicate observation place fails', async t => {
	const placeName = 'duplicate test';

	const firstPlace = await place.create({name: placeName});
	t.truthy(firstPlace, 'created place should exist');
	t.is(firstPlace.toJSON().name, placeName, 'Place name should match');

	await t.throws(async () => {
		await place.create({name: placeName});
	}, {
		instanceOf: ValidationError,
		message: 'A place with the specified name already exists.'
	});
});

test('defining a place without a name fails', async t => {
	await t.throws(async () => {
		await place.create({name: ''});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Validation notEmpty on name failed'
	});

	await t.throws(async () => {
		await place.create();
	}, {
		instanceOf: ValidationError,
		message: 'notNull Violation: place.name cannot be null'
	});
});

test('defining a place that mees the requirements works', async t => {
	const createdPlace = await place.create({name: 'this is a valid place name. please contact help desk for more information'});
	t.truthy(createdPlace, 'created place should exist');
	t.is(createdPlace.toJSON().name, 'this is a valid place name. please contact help desk for more information', 'Place name should match');
});

test('creating a place with only latitude or longitude fails', async t => {
	await t.throws(async () => {
		await place.create({name: 'lat test', latitude: 32});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Require either both latitude and longitude or neither'
	});

	await t.throws(async () => {
		await place.create({name: 'lon test', longitude: 32});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Require either both latitude and longitude or neither'
	});
});

test('creating an observation with weird values should fail', async t => {
	await t.throws(async () => {
		await observation.create();
	}, {
		instanceOf: ValidationError,
		message: 'notNull Violation: observation.temperature cannot be null,\nnotNull Violation: observation.place cannot be null'
	});

	await t.throws(async () => {
		await observation.create({place: t.context.place.id, temperature: -123});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Validation min on temperature failed'
	});

	await t.throws(async () => {
		await observation.create({place: t.context.place.id, temperature: 123});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Validation max on temperature failed'
	});

	await t.throws(async () => {
		await observation.create({place: t.context.place.id, temperature: '32 and half degrees'});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Numbers only please,\nValidation error: Validation isDecimal on temperature failed'
	});

	await t.throws(async () => {
		await observation.create({place: t.context.place.id, temperature: '32.5'});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Numbers only please'
	});

	await t.throws(async () => {
		await observation.create({place: t.context.place.id});
	}, {
		instanceOf: ValidationError,
		message: 'notNull Violation: observation.temperature cannot be null'
	});

	await t.throws(async () => {
		await observation.create({temperature: 37.5});
	}, {
		instanceOf: ValidationError,
		message: 'notNull Violation: observation.place cannot be null'
	});

	await t.throws(async () => {
		await observation.create({place: 'random place', temperature: 37.5});
	}, {
		instanceOf: ValidationError,
		message: 'Validation error: Validation isInt on place failed'
	});

	await t.throws(async () => {
		await observation.create({place: -1, temperature: 37.5});
	}, {
		instanceOf: ForeignKeyConstraintError,
		message: 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed'
	});

	await t.throws(async () => {
		await observation.create({place: 10000, temperature: 37.5});
	}, {
		instanceOf: ForeignKeyConstraintError,
		message: 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed'
	});
});

test('creating a valid observation passes', async t => {
	let it = await observation.create({place: t.context.place.id, temperature: 15});
	const oldId = it.id;
	t.true(it.id > 0);
	t.is(it.temperature, 15);
	t.is(it.place, t.context.place.id);

	it = await observation.create({place: t.context.place.id, temperature: 23.5});
	t.true(it.id > 0);
	t.true(it.id > oldId);
	t.is(it.temperature, 23.5);
	t.is(it.place, t.context.place.id);

	it = await observation.create({place: t.context.place.id, temperature: -12.3});
	t.true(it.id > 0);
	t.true(it.id > oldId);
	t.is(it.temperature, -12.3);
	t.is(it.place, t.context.place.id);
});

test
	.after
	.always('sequelize stops', async t => {
		await sequelize.close();
		t.pass();
	});
