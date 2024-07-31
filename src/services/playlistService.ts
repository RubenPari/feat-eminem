import spotifyApiService from "./spotifyApiService";
import axios from "axios";
import RemoveAllPlaylistTracksResponse from "../models/RemoveAllPlaylistTracksResponse";

const VERSION_API_CLEAR_SONGS = "v1";

async function addTracksToPlaylist(tracks: string[]): Promise<boolean> {
  const limit = 100;
  let offset = 0;

  while (offset < tracks.length) {
    const currentTracks = tracks.slice(offset, offset + limit);

    try {
      const added = await spotifyApiService
        .getInstance()
        .client.addTracksToPlaylist(
          process.env.PLAYLIST_FEAT_EMINEM_ID!,
          currentTracks,
        );

      // Check for successful response
      if (added.statusCode !== 201) {
        console.error(`Failed to add tracks, error: ${added.body}`);
        return false;
      }
    } catch (error) {
      console.error("Error adding tracks to playlist:", error);
      return false;
    }

    offset += limit;
  }

  return true;
}

async function removeAllPlaylistTracks(
  id: string,
): Promise<RemoveAllPlaylistTracksResponse> {
  let responseStatus = RemoveAllPlaylistTracksResponse.Successful;

  const options = {
    method: "GET",
    url:
      process.env.CLEAR_SONGS_API_BASE_URL +
      VERSION_API_CLEAR_SONGS +
      "/playlist/delete-tracks",
    params: {
      id: id,
    },
  };

  try {
    const response = await axios.request(options);

    switch (response.status) {
      case 500:
        console.error("Failed to clear playlist");
        responseStatus = RemoveAllPlaylistTracksResponse.Failed;
        break;
      case 401:
        console.error("Unauthorized to clear playlist");
        responseStatus = RemoveAllPlaylistTracksResponse.Unauthorized;
        break;
    }
  } catch (error) {
    console.error(error);
    responseStatus = RemoveAllPlaylistTracksResponse.Failed;
  }

  return responseStatus;
}

export { addTracksToPlaylist, removeAllPlaylistTracks };
