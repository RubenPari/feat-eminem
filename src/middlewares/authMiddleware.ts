import { FastifyReply, FastifyRequest } from "fastify";
import SpotifyApiService from "../services/spotifyApiService";

async function authMiddleware(_request: FastifyRequest, reply: FastifyReply) {
  // check if request is for /auth endpoints
  if (_request.url.includes("/auth")) {
    return;
  }
  // Check if the client has an access token
  if (!SpotifyApiService.getInstance().client.getAccessToken()) {
    reply.status(401).send({ error: "Unauthorized" });
  }
}

export default authMiddleware;
