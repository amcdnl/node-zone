require('zone.js/dist/zone-node.js');
const Koa = require('koa');
const router = require('koa-router')();

Zone.assertZonePatched();

const app = new Koa();

app.use((ctx, next) => {
  return new Promise((resolve, reject) => {
    const id = Math.random();
    ctx.set('X-Request-Id', id);

    console.log('Middleware Init', id);

    Zone.current.fork({
      name: 'api-id',
      properties: {
        id
      }
    }).run(async () => {
      console.log('Forked!');
      await next();
      resolve();
    });
  });
});

router.get('/', (ctx) => {
  const id = Zone.current.get('id');
  console.log('Request Id', id);

  ctx.status = 200;
  ctx.response.body = id;
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);