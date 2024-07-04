import SpotifyApiService from "./spotifyApiService";

const client = SpotifyApiService.getInstance().client;
const INTERNATIONAL_RADIO_EDIT = "International Radio Edit";
const RADIO_EDIT = "Radio Edit";
const LIVE = "Live";
const EDITED = "(Edited)";
const ACOUSTIC = "Acoustic";
const INSTRUMENTAL = "Instrumental";
const NBA_VERSION = "NBA Version";

export async function searchTracksEminem(): Promise<
  SpotifyApi.TrackObjectFull[]
> {
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

  return tracks;
}

export async function searchTracksFeatEminem(): Promise<
  SpotifyApi.TrackObjectFull[]
> {
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

  return tracks;
}

export async function searchTracksWithEminem(): Promise<
  SpotifyApi.TrackObjectFull[]
> {
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

  return tracks;
}

export async function getAllTracksD12(): Promise<
  SpotifyApi.TrackObjectSimplified[]
> {
  const d12Artist = await client.searchArtists("D12").then((res) => {
    return res.body.artists!.items[0];
  });

  // get all albums from D12
  const albums = await client
    .getArtistAlbums(d12Artist.id, {
      include_groups: "include_groups=album,single",
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

  return tracks;
}

export async function getAllTracksBadMeetsEvil(): Promise<
  SpotifyApi.TrackObjectSimplified[]
> {
  const badMeetsEvilArtist = await client
    .searchArtists("Bad Meets Evil")
    .then((res) => {
      return res.body.artists!.items[0];
    });

  // get all albums from Bad Meets Evil
  const albums = await client
    .getArtistAlbums(badMeetsEvilArtist.id, {
      include_groups: "include_groups=album,single",
    })
    .then((res) => res.body.items);

  const tracks = Array<SpotifyApi.TrackObjectSimplified>();

  // get all tracks from Bad Meets Evil albums
  for (const album of albums) {
    const albumTracks = await client
      .getAlbumTracks(album.id)
      .then((res) => res.body.items);

    tracks.push(...albumTracks);
  }

  return tracks;
}

// remove duplicates based on track name
export async function removeDuplicateTracks(
  tracks: {
    artists: SpotifyApi.ArtistObjectSimplified[];
    name: string;
  }[],
): Promise<
  {
    artists: SpotifyApi.ArtistObjectSimplified[];
    name: string;
  }[]
> {
  // filter tracks with extra content in name
  let filteredTracks = tracks.filter((track) => {
    return (
      !track.name.includes(INTERNATIONAL_RADIO_EDIT) &&
      !track.name.includes(RADIO_EDIT) &&
      !track.name.includes(LIVE) &&
      !track.name.includes(EDITED) &&
      !track.name.includes(ACOUSTIC) &&
      !track.name.includes(INSTRUMENTAL) &&
      !track.name.includes(NBA_VERSION)
    );
  });

  // remove track where string name is similar (80%) to another track
  filteredTracks = filteredTracks.filter((track) => {
    return !filteredTracks.find((t) => {
      return t.name.includes(track.name) && t.name !== track.name;
    });
  });

  // remove duplicates based on multiple remastered versions (es "2007 Remaster" and "2005 Remaster") taking the most recent
  filteredTracks = filteredTracks.filter((track) => {
    return !filteredTracks.find((t) => {
      return (
        t.name.includes("Remaster") &&
        t.name.includes(track.name) &&
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
