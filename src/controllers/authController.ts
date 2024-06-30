import { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import SpotifyApiService from '../services/spotifyApiService';

const login = async (_request: FastifyRequest, reply: FastifyReply) => {

  const scopes = process.env.SCOPES ? process.env.SCOPES.split(' ') : [];

  const state = uuidv4();

  const authorizeURL = SpotifyApiService.getInstance().client.createAuthorizeURL(scopes, state);

  reply.redirect(authorizeURL);
};

const callback = async (request: FastifyRequest, reply: FastifyReply) => {
  const code = (request.query as any).code as string;

  try {
    const data = await SpotifyApiService.getInstance().client.authorizationCodeGrant(code);

    const { access_token, refresh_token } = data.body;

    SpotifyApiService.getInstance().client.setAccessToken(access_token);
    SpotifyApiService.getInstance().client.setRefreshToken(refresh_token);

    reply.send('You are now logged in to Spotify!');
  } catch (error) {
    console.error(error);
    reply.send('An error occurred while trying to log in to Spotify.');
  }
};

const logout = async (_request: FastifyRequest, reply: FastifyReply) => {
  SpotifyApiService.getInstance().client.resetAccessToken();
  SpotifyApiService.getInstance().client.resetRefreshToken();

  reply.send('You are now logged out of Spotify!');
};

export default {
  login,
  callback,
  logout,
};
