import SpotifyWebApi from "spotify-web-api-node";
import LoadEnv from "../utils/loadEnv";

class SpotifyApiService {
  private static instance: SpotifyApiService;
  public client: SpotifyWebApi;

  private constructor() {
    LoadEnv();

    this.client = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
    });
  }

  public static getInstance(): SpotifyApiService {
    if (!SpotifyApiService.instance) {
      SpotifyApiService.instance = new SpotifyApiService();
    }
    return SpotifyApiService.instance;
  }
}

export default SpotifyApiService;
