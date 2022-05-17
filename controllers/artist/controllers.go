package artist

import (
	"encoding/json"
	"github.com/RubenPari/feat-eminem/models"
	"github.com/RubenPari/feat-eminem/modules"
	"github.com/zmb3/spotify/v2"
	"log"
	"net/http"
)

func Add(w http.ResponseWriter, r *http.Request) {
	spotifyClient, ctx := modules.GetSpotifyClient()

	// get name artist
	name := r.URL.Query().Get("name")

	// search artist
	artistApi, err := spotifyClient.Search(ctx, name, spotify.SearchTypeArtist)

	if err != nil || artistApi == nil {
		log.Fatalf("couldn't get artist information: %v", err)
	}

	artist := models.Artist{
		Id:   artistApi.Artists.Artists[0].ID,
		Uri:  artistApi.Artists.Artists[0].URI,
		Name: artistApi.Artists.Artists[0].Name,
	}

	// TODO: save artist in database
	_ = json.NewEncoder(w).Encode(artist)
}

func GetAllSongs(w http.ResponseWriter, r *http.Request) {
	clientSpotify, ctx := modules.GetSpotifyClient()

	// get name artist
	name := r.URL.Query().Get("name")
	artist, _ := clientSpotify.Search(ctx, name, spotify.SearchTypeArtist)
	artistSpotObj := artist.Artists.Artists[0]

	// get all album of artist
	albums, err := clientSpotify.GetArtistAlbums(ctx, artistSpotObj.ID, []spotify.AlbumType{1, 2})
	if err != nil || albums == nil {
		log.Fatalf("couldn't get artist albums: %v", err)
	}

	var albumsArtist []models.Album

	for _, album := range albums.Albums {
		albumsArtist = append(albumsArtist, models.Album{
			Id:   album.ID,
			Name: album.Name,
			Uri:  album.URI,
		})
	}

	var tracks []models.Track

	// get all tracks of albums
	for _, album := range albumsArtist {
		tracksAlbum, err := clientSpotify.GetAlbumTracks(ctx, album.Id)
		if err != nil || tracksAlbum == nil {
			log.Fatalf("couldn't get album tracks: %v", err)
		}

		// convert object api to my object
		for _, track := range tracksAlbum.Tracks {
			tracks = append(tracks, models.Track{
				Id:   track.ID,
				Uri:  track.URI,
				Name: track.Name,
			})
		}
	}

	_ = json.NewEncoder(w).Encode(tracks)

}
