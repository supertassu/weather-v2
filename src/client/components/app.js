import React from 'react';
import {get} from 'axios/index';
import PlaceData from './placedata';

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
			this.setState({error: `${placesData.status} - ${placesData.statusText}`});

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

		this.setState({
			data: places
		});
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

		console.log(this.state);

		const listItems = [];

		for (const key in this.state.data) {
			if (!Object.prototype.hasOwnProperty.call(this.state.data, key)) {
				continue;
			}

			const place = this.state.data[key];

			console.log('place id', key, place);

			listItems.push(<PlaceData ref={`container-${key}`} key={`${key}-data`} name={place} id={key}/>);
		}

		return (
			<div>
				<h1>Weather Application</h1>
				<div>{listItems}</div>
			</div>
		);
	}
}
