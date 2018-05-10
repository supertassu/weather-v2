import Sequelize from 'sequelize';
import sequelize from '../sequelize';

const place = sequelize.define('place', {
	name: {
		type: Sequelize.TEXT,
		unique: {
			name: 'place',
			msg: 'A place with the specified name already exists.'
		},
		allowNull: false,
		validate: {
			notEmpty: true
		}
	},
	latitude: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: null,
		validate: {min: -90, max: 90}
	},
	longitude: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: null,
		validate: {min: -180, max: 180}
	}
}, {
	timestamps: true,
	instanceMethods: {
		async toJSON() {
			return {
				id: this.id,
				createdAt: this.createdAt,
				name: this.name
			};
		}
	},
	validate: {
		bothCoordsOrNone() {
			if ((this.latitude === null) !== (this.longitude === null)) {
				throw new Error('Require either both latitude and longitude or neither');
			}
		}
	}
});

export default place;
