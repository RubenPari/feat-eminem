import { FastifyReply, FastifyRequest } from 'fastify';
import SpotifyWebApi from 'spotify-web-api-node';
import { v4 as uuidv4 } from 'uuid';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const login = async (_request: FastifyRequest, reply: FastifyReply) => {

  const scopes = process.env.SPOTIFY_SCOPES ? process.env.SPOTIFY_SCOPES.split(',') : [];

  const state = uuidv4();

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  reply.redirect(authorizeURL);
};

const callback = async (request: FastifyRequest, reply: FastifyReply) => {
  const code = (request.query as any).code as string;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    const { access_token, refresh_token } = data.body;

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    reply.send('You are now logged in to Spotify!');
  } catch (error) {
    console.error(error);
    reply.send('An error occurred while trying to log in to Spotify.');
  }
};

const logout = async (_request: FastifyRequest, reply: FastifyReply) => {
  spotifyApi.resetAccessToken();
  spotifyApi.resetRefreshToken();

  reply.send('You are now logged out of Spotify!');
};

export default {
  login,
  callback,
  logout,
};
