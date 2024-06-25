import { FastifyInstance } from 'fastify';
import authController from '../controllers/authController';

const setUpRoutes = async (fastify: FastifyInstance) => {
  // ######## /auth ########
  fastify.register((fastify, _opts, done) => {
    fastify.get('/login', authController.login);
    fastify.get('/callback', authController.callback);
    fastify.get('/logout', authController.logout);
    done();
  }, { prefix: '/auth' });
};

export default setUpRoutes;
