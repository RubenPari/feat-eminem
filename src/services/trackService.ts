import SpotifyApiService from "./spotifyApiService";
import TrackDto from "../dto/trackDto";
import convertTracksObjectToDto from "../utils/convertTracksObject";
import axios from "axios";

const client = SpotifyApiService.getInstance().client;
const INTERNATIONAL_RADIO_EDIT = "International Radio Edit";
const RADIO_EDIT = "Radio Edit";
const LIVE = "Live";
const EDITED = "(Edited)";
const ACOUSTIC = "Acoustic";
const INSTRUMENTAL = "Instrumental";
const NBA_VERSION = "NBA Version";
const DETRIMENTAL = " Detrimental";
const CLEAR = "Clear";

/**
 * Search tracks with query string "Eminem"
 */
async function searchTracksEminem(): Promise<TrackDto[]> {
  const limit = 50;
  let offset = 0;
  const maxOffset = 1000;

  const tracks = Array<SpotifyApi.TrackObjectFull>();

  while (offset < maxOffset) {
    const searchTracksEminem = await client.searchTracks("Eminem", {
      limit,
      offset,
    });

    tracks.push(...(searchTracksEminem.body.tracks?.items ?? []));

    offset += limit;
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * Search tracks with query string "feat. Eminem"
 */
async function searchTracksFeatEminem(): Promise<TrackDto[]> {
  const limit = 50;
  let offset = 0;
  const maxOffset = 1000;

  const tracks = Array<SpotifyApi.TrackObjectFull>();

  while (offset < maxOffset) {
    const searchTracksFeatEminem = await client.searchTracks("feat. Eminem", {
      limit,
      offset,
    });

    tracks.push(...(searchTracksFeatEminem.body.tracks?.items ?? []));

    offset += limit;
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * Search tracks with query string "with Eminem"
 */
async function searchTracksWithEminem(): Promise<TrackDto[]> {
  const limit = 50;
  let offset = 0;
  const maxOffset = 1000;

  const tracks = Array<SpotifyApi.TrackObjectFull>();

  while (offset < maxOffset) {
    const searchTracksWithEminem = await client.searchTracks("with Eminem", {
      limit,
      offset,
    });

    tracks.push(...(searchTracksWithEminem.body.tracks?.items ?? []));

    offset += limit;
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * Get all tracks from D12
 */
async function getAllTracksD12(): Promise<TrackDto[]> {
  const d12Artist = await client.searchArtists("D12").then((res) => {
    return res.body.artists!.items[0];
  });

  // get all albums from D12
  const albums = await client
    .getArtistAlbums(d12Artist.id, {
      include_groups: "album,single,compilation",
    })
    .then((res) => res.body.items);

  const tracks = Array<SpotifyApi.TrackObjectSimplified>();

  // get all tracks from D12 albums
  for (const album of albums) {
    const albumTracks = await client
      .getAlbumTracks(album.id)
      .then((res) => res.body.items);

    tracks.push(...albumTracks);
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * Get all tracks from Bad Meets Evil
 */
async function getAllTracksBadMeetsEvil(): Promise<TrackDto[]> {
  const badMeetsEvilArtist = await client
    .searchArtists("Bad Meets Evil")
    .then((res) => {
      return res.body.artists!.items[0];
    });

  // get all albums from Bad Meets Evil
  let albums = await client
    .getArtistAlbums(badMeetsEvilArtist.id, {
      include_groups: "album,single,compilation",
    })
    .then((res) => res.body.items);

  // remove album with name "Hell: The Sequel"
  // for leave only "Hell: The Sequel (Deluxe Edition)"
  albums = albums.filter((album) => album.name !== "Hell: The Sequel");

  const tracks = Array<SpotifyApi.TrackObjectSimplified>();

  // get all tracks from Bad Meets Evil albums
  for (const album of albums) {
    const albumTracks = await client
      .getAlbumTracks(album.id)
      .then((res) => res.body.items);

    tracks.push(...albumTracks);
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * Remove duplicate tracks based on track name
 */
async function removeDuplicateTracks(tracks: TrackDto[]): Promise<TrackDto[]> {
  // filter tracks with extra content in name
  let filteredTracks = tracks.filter((track) => {
    return (
      !track.name.includes(INTERNATIONAL_RADIO_EDIT) &&
      !track.name.includes(RADIO_EDIT) &&
      !track.name.includes(LIVE) &&
      !track.name.includes(EDITED) &&
      !track.name.includes(ACOUSTIC) &&
      !track.name.includes(INSTRUMENTAL) &&
      !track.name.includes(NBA_VERSION) &&
      !track.name.includes(CLEAR) &&
      !track.name.includes(DETRIMENTAL)
    );
  });

  // remove track where string name is similar (80%) to another track
  filteredTracks = filteredTracks.filter((track) => {
    return !filteredTracks.find((t) => {
      return t.name.includes(track.name) && t.name !== track.name;
    });
  });

  // remove duplicates based on multiple remastered versions
  // (es "2007 Remaster" and "2005 Remaster" taking "2007 Remaster" only)
  filteredTracks = filteredTracks.filter((track) => {
    return !filteredTracks.find((t) => {
      return (
        t.name.includes("Remaster") &&
        track.name.includes("Remaster") &&
        t.name !== track.name
      );
    });
  });

  // remove duplicates based on track name completely equal
  filteredTracks = filteredTracks.filter((track, index, self) => {
    return index === self.findIndex((t) => t.name === track.name);
  });

  return filteredTracks;
}

async function orderTracksByListeners(tracks: TrackDto[]): Promise<TrackDto[]> {
  const tracks_1 = tracks.slice(0, 5);

  for (const track of tracks_1) {
    const options = {
      method: "GET",
      url: process.env.X_RAPIDAPI_BASE_ENDPOINT,
      params: {
        q: track.name,
      },
      headers: {
        "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);

    // get number of views from YouTube video
    track.listeners = Number(response.data.contents[0].video.stats.views);
  }

  return tracks_1.sort((a, b) => b.listeners - a.listeners);
}

export {
  searchTracksEminem,
  searchTracksFeatEminem,
  searchTracksWithEminem,
  getAllTracksD12,
  getAllTracksBadMeetsEvil,
  removeDuplicateTracks,
  orderTracksByListeners,
};
