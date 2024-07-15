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

async function orderTracksByListeners(tracks: TrackDto[]){
  const tracksWithViewCount = new Array<{name: string, viewCount: number}>();

  const apiKey = process.env.YOUTUBE_API_KEY;

  const youtubeApi = google.youtube({
      version: 'v3',
      auth: apiKey
  });

  tracks.forEach(async track => {
    let idVideo = '';

    youtubeApi.search.list({
      part: ['snippet'],
      q: track.name,
      type: ['video'],
      maxResults: 1,
      order: 'viewCount'
    }, (err, response) => {
      if (err) {
        console.error('Errore durante l\'ottenimento delle views della traccia:', track.name);
        return;
      }

      idVideo = response?.data.items?.[0]?.id?.videoId || '';
    });

    // get views of the video
    const videoStatistic = await youtubeApi.videos.list(
      {
        part: ['statistics'],
        id: [idVideo]
      },
      {
        key: apiKey
      }
    );

    // get viewCount of the video
    const viewCount = videoStatistic.data.items?.[0]?.statistics?.viewCount || 0;

    // add track to the array used to order the tracks
    tracksWithViewCount.push({name: track.name, viewCount: Number(viewCount)});
  });

  // create a new array with the tracks ordered by viewCount
  return tracksWithViewCount.sort((a, b) => b.viewCount - a.viewCount).map(track => {
    return tracks.find(t => t.name === track.name);
  });
}

export {
  searchTracksEminem,
  searchTracksFeatEminem,
  searchTracksWithEminem,
  getAllTracksD12,
  getAllTracksBadMeetsEvil,
  removeDuplicateTracks,
};
