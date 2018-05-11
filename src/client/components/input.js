/* global location */

import React from 'react';
import PropTypes from 'prop-types';
import {post} from 'axios/index';

export default class Input extends React.Component {
	constructor() {
		super();
		this.state = {
			selectedKey: 1,
			text: '',
			errorText: null
		};
	}

	render() {
		const places = [];

		for (const key in this.props.names) {
			if (!Object.prototype.hasOwnProperty.call(this.props.names, key)) {
				continue;
			}

			const value = this.props.names[key];

			places.push(
				<option key={key} value={key}>
					{value}
				</option>
			);
		}

		return (
			<div>
				<fieldset>
					<legend>Update value</legend>
					<form onSubmit={async event => {
							event.preventDefault();
							post(`/observations/new`, {
								place: this.state.selectedKey,
								temperature: parseFloat(this.state.text)
							}).then(res => {
								console.log('submitted', res.status, res.statusText, res.data);
								location.reload(); // This can be imporoved a lot.
							}).catch(res => {
								if (res.response.data.userFriendlyMessages) {
									this.setState({
										errorText: res.response.data.userFriendlyMessages.join(', ')
									});
								}
								console.log('submitted', res.message, res.response.status, res.response.data);
							});
					}}
					>
						<select onChange={event => {
							this.setState({
								selectedKey: event.target.value
							});
						}}
						>
							{places}
						</select> &nbsp;
						<input type="number" name="value" onChange={event => this.setState({text: event.target.value})}/><br/>
						{this.state.errorText &&
						<fieldset>
							<legend>Error!</legend>
							{this.state.errorText}
						</fieldset>
						}
					</form>
				</fieldset>
			</div>
		);
	}
}

Input.propTypes = {
	names: PropTypes.object
};

Input.defaultProps = {
	names: {}
};
