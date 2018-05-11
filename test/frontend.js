import '@babel/polyfill';

import test from 'ava';
import React from 'react';
import render from 'react-test-renderer';
import PlaceData from '../src/client/components/placedata';
import Input from '../src/client/components/input';

test('Place data without observations', t => {
	const tree = render.create(<PlaceData name="cool name" id="123"/>).toJSON();
	t.snapshot(tree);
});

test('Place data with partial observation', t => {
	const tree = render.create(<PlaceData name="cool name" id="123" temperature="123"/>).toJSON();
	t.snapshot(tree);
});

test('Place data with observation', t => {
	const tree = render.create(<PlaceData name="cool name" id="123" temperature="123" lastObserved="123"/>).toJSON();
	t.snapshot(tree);
});

test('input without any places', t => {
	const tree = render.create(<Input/>).toJSON();
	t.snapshot(tree);
});

test('input with places', t => {
	const tree = render.create(<Input names={{1: '456', 2: '523'}}/>).toJSON();
	t.snapshot(tree);
});
