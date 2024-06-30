import { FastifyRequest, FastifyReply } from 'fastify';
import SpotifyApiService from '../services/spotifyApiService';

const featEminem = async (_req: FastifyRequest, res: FastifyReply) => {
  const client = SpotifyApiService.getInstance().client;

  // search all tracks with query 'Eminem' and where first artist isn't Eminem
    const searchTracksEminem = await client.searchTracks('Eminem', { limit: 50 });

    const searchTracksFeatEminem = await client.searchTracks('feat. Eminem', { limit: 50 });

    const searchTracksWithEminem = await client.searchTracks('with Eminem', { limit: 50 });

    const tracks = (searchTracksEminem.body.tracks?.items ?? []).concat(
        searchTracksFeatEminem.body.tracks?.items ?? [],
        searchTracksWithEminem.body.tracks?.items ?? [],
    );

    const filteredTracks = tracks?.filter((track) => {
        return track.artists[0].name !== 'Eminem' && track.artists.find((artist) => artist.name === 'Eminem');
    });

    // remove duplicates based on track name
    const uniqueTracks = filteredTracks?.filter((track, index, self) => {
        return index === self.findIndex((t) => (
            t.name === track.name
        ));
    });

    // create a json array with only track name and artist name
    const result = uniqueTracks?.map((track) => {
        return {
            track: track.name,
            artist: track.artists[0].name,
        };
    });

    res.status(200).send(result);
};

export default {
  featEminem,
};
