import SpotifyApiService from "./spotifyApiService";
import TrackDto from "../dto/trackDto";
import convertTracksObjectToDto from "../utils/convertTracksObject";
import { google } from "googleapis";

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
  const apiKey = process.env.YOUTUBE_API_KEY;

  const youtubeApi = google.youtube({
    version: "v3",
    auth: apiKey,
  });

  const tracksWithViewCount = await Promise.all(
    tracks.map(async (track) => {
      try {
        // Get the video ID for the first search result
        const searchResponse = await youtubeApi.search.list({
          part: ["snippet"],
          q: track.name,
          type: ["video"],
          maxResults: 1,
          order: "viewCount",
        });

        const videoId = searchResponse.data.items?.[0]?.id?.videoId || null;

        if (!videoId) {
          console.error(`Nobody video found for track: ${track.name}`);
          return { track, viewCount: 0 };
        }

        // Get the view count for the video
        const videoResponse = await youtubeApi.videos.list({
          part: ["statistics"],
          id: [videoId],
        });

        const viewCount = Number(
          videoResponse.data.items?.[0]?.statistics?.viewCount || 0,
        );

        return { track, viewCount };
      } catch (error) {
        console.error(
          `Error while getting view count for track: ${track.name}`,
        );

        return { track, viewCount: 0 };
      }
    }),
  );

  // Ordina le tracce in base al numero di visualizzazioni e mappa ai risultati originali
  return tracksWithViewCount
    .sort((a, b) => b.viewCount - a.viewCount)
    .map(({ track }) => track);
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
