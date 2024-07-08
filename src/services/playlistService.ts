import spotifyApiService from "./spotifyApiService";

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

export { addTracksToPlaylist };
