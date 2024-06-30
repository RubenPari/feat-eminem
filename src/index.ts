import fastify from 'fastify';
import setUpRoutes from './routes/route';
import loadEnv from './utils/loadEnv';

const server = fastify();

loadEnv();

setUpRoutes(server).then(() => {
  console.log('Routes set up successfully!');
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
