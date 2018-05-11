import React from 'react';
import PropTypes from 'prop-types';

export default class PlaceData extends React.Component {
	render() {
		return (
			<div>
				<fieldset>
					<legend>{this.props.name}</legend>
					{this.props.id}
				</fieldset>

			</div>
		);
	}
}

PlaceData.propTypes = {
	name: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired
};
