import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import place from './place';

const observation = sequelize.define('observation', {
	temperature: {
		type: Sequelize.FLOAT,
		validate: {
			min: -50,
			max: 55,
			isDecimal: true,
			isNumber(value) {
				if (JSON.stringify(value).indexOf('"') !== -1) {
					throw new TypeError('Numbers only please');
				}
			}
		},
		allowNull: false
	},
	place: {
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			isInt: true
		},
		references: {
			model: place,
			key: 'id'
		}
	}
}, {
	timestamps: true,
	instanceMethods: {
		async toJSON() {
			return {
				id: this.id,
				createdAt: this.createdAt,
				place: this.place,
				temperature: this.temperature
			};
		}
	}
});

export default observation;
