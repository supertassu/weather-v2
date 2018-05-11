import React from 'react';
import {get} from 'axios/index';

export default class App extends React.Component {
	constructor() {
		super();

		this.state = {
			data: null,
			error: null
		};
	}

	async componentWillMount() {
		const placesData = await get('/places');

		if (placesData.status !== 200) {
			this.setState({
				error: `${placesData.status} - ${placesData.statusText}`
			});

			console.error('error: ', placesData);
			return;
		}

		const places = {};

		for (const key in placesData.data.results) {
			if (!Object.prototype.hasOwnProperty.call(placesData.data.results, key)) {
				continue;
			}

			places[placesData.data.results[key].id] = placesData.data.results[key].name;
		}
	}

	render() {
		if (this.state.error) {
			return (
				<div>
					<h1>Error</h1>
					<p>{this.state.error}</p>
				</div>
			);
		}

		if (!this.state.data) {
			return <h1>Hello world!</h1>;
		}

		return <h1>Loaded.</h1>;
	}
}
