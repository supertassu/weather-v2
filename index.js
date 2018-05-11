import '@babel/polyfill';

import server from './src/server/server';
import db from './src/server/sequelize';

db.sync().then(() => {
	server.listen(process.env.port || 3000);
	console.log(`Listening at ${process.env.port || 3000}`);
});
