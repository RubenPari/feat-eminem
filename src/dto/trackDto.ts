interface TrackDto {
  uri: string;
  artists: SpotifyApi.ArtistObjectSimplified[];
  name: string;
  listeners: number;
}

export default TrackDto;
