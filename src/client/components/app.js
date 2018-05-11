import React from 'react';
import {get} from 'axios/index';
import PlaceData from './placedata';

export default class App extends React.Component {
	constructor() {
		super();

		this.state = {
			places: null,
			error: null,
			placeData: {}
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

			get(`/observations/latest/${placesData.data.results[key].id}`).then(placeData => {
				if (placeData.status !== 200) {
					this.setState({error: `${placeData.status} - ${placeData.statusText}`});

					console.error('error: ', placeData);
					return;
				}

				if (placeData.data.result === 'none') {
					return;
				}

				const map = {};
				map[placesData.data.results[key].id] = [placeData.data.result.temperature, placeData.data.result.createdAt];

				this.setState(old => {
					return {placeData: Object.assign(map, old.placeData)};
				});
			});
		}

		this.setState({
			places
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

		if (!this.state.places) {
			return <h1>Hello world!</h1>;
		}

		const listItems = [];

		for (const key in this.state.places) {
			if (!Object.prototype.hasOwnProperty.call(this.state.places, key)) {
				continue;
			}

			const place = this.state.places[key];

			let temperature = 'no data';
			let observed = null;

			if (this.state.placeData[key]) {
				temperature = this.state.placeData[key][0].toString();
				observed = this.state.placeData[key][1];
			}

			listItems.push(<PlaceData ref={`container-${key}`} key={`${key}-data`} name={place} id={key} temperature={temperature} lastObserved={observed}/>);
		}

		return (
			<div>
				<h1>Weather Application</h1>
				<div>{listItems}</div>
			</div>
		);
	}
}
