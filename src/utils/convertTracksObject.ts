import TrackDto from "../dto/trackDto";

function convertTracksObjectToDto(
  tracksObjects:
    | SpotifyApi.TrackObjectFull[]
    | SpotifyApi.TrackObjectSimplified[],
): TrackDto[] {
  return tracksObjects.map((trackObject) => {
    return {
      uri: trackObject.uri,
      name: trackObject.name,
      artists: trackObject.artists,
    };
  });
}

export default convertTracksObjectToDto;
