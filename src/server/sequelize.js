import Sequelize from 'sequelize';

const sequelize = new Sequelize({
	logging: false,
	dialect: 'sqlite',
	storage: process.env.NODE_ENV === 'test' ? './db/test.sqlite' : './db/db.sqlite',
	operatorsAliases: false
});

export default sequelize;
