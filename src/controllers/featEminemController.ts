import { FastifyRequest, FastifyReply } from "fastify";
import {
  getAllTracksBadMeetsEvil,
  getAllTracksD12,
  orderTracksByListeners,
  removeDuplicateTracks,
  searchTracksEminem,
  searchTracksFeatEminem,
  searchTracksWithEminem,
} from "../services/trackService";
import { addTracksToPlaylist } from "../services/playlistService";
import TrackDto from "../dto/trackDto";

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
    searchTracksWithEminemResult
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

  // order tracks by number of listeners on youtube
  let orderedTracks = new Array<TrackDto>();
  try {
    orderedTracks = await orderTracksByListeners(uniqueTracks);
  } catch (e) {
    console.log(e);
  }

  // add tracks to playlist
  const added = await addTracksToPlaylist(
    orderedTracks.map((track) => track.uri)
  );

  if (!added) {
    return res.status(500).send("error to add tracks to playlist");
  }

  res.status(200).send("tracks added to playlist");
};

export default {
  featEminem,
};
