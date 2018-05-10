import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import Router from 'koa-router';
import send from 'koa-send';
import cors from 'kcors';

import place from './controllers/place';

const app = new Koa();
let http = null;

app.use(logger());

app.use(cors({credentials: true}));
app.use(bodyParser());

const router = new Router();

router.get('/', async ctx => {
	await send(ctx, './src/client/assets/index.html');
}).get('/bundle.js', async ctx => {
	await send(ctx, './dist/bundle.js');
});

router.post('/places/new', place.create);
router.get('/places', place.query);
router.get('/places/:id', place.query);

app
	.use(router.routes())
	.use(router.allowedMethods());

function listen(port) {
	if (http !== null) {
		throw new Error('already listening');
	}

	http = app.listen(port);
}

function stop() {
	if (http === null) {
		throw new Error('not yet listening');
	}

    http.close();
    http = null;
}

export default {
	listen,
	stop,
	http: () => {
		return http;
	},
	app: () => {
		return app;
	},
	router: () => {
		return router;
	}
};
