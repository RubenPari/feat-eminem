interface TrackDto {
  uri: string;
  artists: SpotifyApi.ArtistObjectSimplified[];
  name: string;
}

export default TrackDto;
