import { FastifyRequest, FastifyReply } from "fastify";
import {
  getAllTracksBadMeetsEvil,
  getAllTracksD12,
  removeDuplicateTracks,
  searchTracksEminem,
  searchTracksFeatEminem,
  searchTracksWithEminem,
} from "../services/trackService";

const featEminem = async (_req: FastifyRequest, res: FastifyReply) => {
  // search all tracks with query 'Eminem' and where first artist isn't Eminem
  const searchTracksEminemResult = await searchTracksEminem();
  const searchTracksFeatEminemResult = await searchTracksFeatEminem();
  const searchTracksWithEminemResult = await searchTracksWithEminem();

  const tracksBadMeetsEvil = await getAllTracksBadMeetsEvil();
  const tracksD12 = await getAllTracksD12();

  // combine all search results without tracks from Bad Meets Evil and D12
  const tracks = searchTracksEminemResult.concat(
    searchTracksFeatEminemResult,
    searchTracksWithEminemResult,
  );

  // filter out tracks where Eminem is present but not as first artist
  const filteredTracks = tracks.filter((track) => {
    return (
      track.artists[0].name !== "Eminem" &&
      track.artists.find((artist) => artist.name === "Eminem")
    );
  });

  // added tracks from Bad Meets Evil and D12
  filteredTracks.push(...tracksBadMeetsEvil, ...tracksD12);

  const uniqueTracks = await removeDuplicateTracks(filteredTracks);

  // create a json array with only track name and artist name
  const result = uniqueTracks.map((track) => {
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
