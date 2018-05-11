import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const formatDate = lastObserved => {
	if (!lastObserved) {
		return '-';
	}

	return dayjs(lastObserved).format('DD.MM.YY hh:mm:ss');
};

export default class PlaceData extends React.Component {
	render() {
		return (
			<div>
				<fieldset>
					<legend>{this.props.name} (id: {this.props.id})</legend>
					<p>Temperature: {this.props.temperature} (observed at {formatDate(this.props.lastObserved)})</p>
				</fieldset>
			</div>
		);
	}
}

PlaceData.propTypes = {
	name: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	temperature: PropTypes.string,
	lastObserved: PropTypes.string
};

PlaceData.defaultProps = {
	temperature: -999,
	lastObserved: null
};
