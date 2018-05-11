import React from 'react';
import PropTypes from 'prop-types';

export default class PlaceData extends React.Component {
	render() {
		return <h1>{this.props.name} (id {this.props.id})</h1>;
	}
}

PlaceData.propTypes = {
	name: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired
};
