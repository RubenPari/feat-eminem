import { FastifyRequest, FastifyReply } from "fastify";
import {
  getAllTracksBadMeetsEvil,
  getAllTracksD12,
  searchTracksEminem,
  searchTracksFeatEminem,
  searchTracksWithEminem,
} from "../services/trackService";

const featEminem = async (_req: FastifyRequest, res: FastifyReply) => {
  // search all tracks with query 'Eminem' and where first artist isn't Eminem
  const searchTracksEminemResult = (await searchTracksEminem()).map((track) => {
    return {
      name: track.name,
      artists: track.artists,
    };
  });
  const searchTracksFeatEminemResult = (await searchTracksFeatEminem()).map(
    (track) => {
      return {
        name: track.name,
        artists: track.artists,
      };
    },
  );
  const searchTracksWithEminemResult = (await searchTracksWithEminem()).map(
    (track) => {
      return {
        name: track.name,
        artists: track.artists,
      };
    },
  );
  const tracksBadMeetsEvil = (await getAllTracksBadMeetsEvil()).map((track) => {
    return {
      name: track.name,
      artists: track.artists,
    };
  });
  const tracksD12 = (await getAllTracksD12()).map((track) => {
    return {
      name: track.name,
      artists: track.artists,
    };
  });

  // combine all search results
  const tracks = searchTracksEminemResult.concat(
    searchTracksFeatEminemResult,
    searchTracksWithEminemResult,
    tracksBadMeetsEvil,
    tracksD12,
  );

  // filter out tracks where Eminem is present but not as first artist
  const filteredTracks = tracks.filter((track) => {
    return (
      track.artists[0].name !== "Eminem" &&
      track.artists.find((artist) => artist.name === "Eminem")
    );
  });

  // remove duplicates based on track name
  const uniqueTracks = filteredTracks.filter((track, index, self) => {
    return index === self.findIndex((t) => t.name === track.name);
  });

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
