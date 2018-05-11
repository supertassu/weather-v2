import '@babel/polyfill';

import test from 'ava';
import React from 'react';
import render from 'react-test-renderer';
import PlaceData from '../src/client/components/placedata';

test('Place data without observations', t => {
	const tree = render.create(<PlaceData name="cool name" id="123"/>).toJSON();
	t.snapshot(tree);
});

test('Place data with observation', t => {
	const tree = render.create(<PlaceData name="cool name" id="123" temperature="123" lastObserved="123"/>).toJSON();
	t.snapshot(tree);
});
