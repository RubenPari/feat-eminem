package artist

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/RubenPari/feat-eminem/models"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/oauth2/clientcredentials"
)

func Add(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// create config object for spotify api access
	config := &clientcredentials.Config{
		ClientID:       os.Getenv("CLIENT_ID"),
		ClientSecret:   os.Getenv("CLIENT_SECRET"),
		TokenURL:       "https://accounts.spotify.com/api/token",
		Scopes:         []string{},
		EndpointParams: map[string][]string{},
		AuthStyle:      0,
	}

	token, err := config.Token(ctx)
	if err != nil {
		log.Fatalf("couldn't get token: %v", err)
	}

	// create spotify client
	httpClient := spotifyauth.New().Client(ctx, token)
	clientSpotify := spotify.New(httpClient)

	// get name artist
	name := r.URL.Query().Get("name")

	// search artist
	artist_api, err := clientSpotify.Search(ctx, name, spotify.SearchTypeArtist)

	if err != nil || artist_api == nil {
		log.Fatalf("couldn't get artist information: %v", err)
	}

	artist := models.Artist{
		Id:   artist_api.Artists.Artists[0].ID,
		Uri:  artist_api.Artists.Artists[0].URI,
		Name: artist_api.Artists.Artists[0].Name,
	}

	// TODO: save artist in database
	json.NewEncoder(w).Encode(artist)
}

// TODO: complete
func GetAllSongs(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// create config object for spotify api access
	config := &clientcredentials.Config{
		ClientID:       os.Getenv("CLIENT_ID"),
		ClientSecret:   os.Getenv("CLIENT_SECRET"),
		TokenURL:       "https://accounts.spotify.com/api/token",
		Scopes:         []string{},
		EndpointParams: map[string][]string{},
		AuthStyle:      0,
	}

	token, err := config.Token(ctx)
	if err != nil {
		log.Fatalf("couldn't get token: %v", err)
	}

	// create spotify client
	httpClient := spotifyauth.New().Client(ctx, token)
	clientSpotify := spotify.New(httpClient)

	// get all album of artist
	albums, err := clientSpotify.GetArtistAlbums(ctx, artist.Id, []spotify.AlbumType{1, 2})
	if err != nil || albums == nil {
		log.Fatalf("couldn't get artist albums: %v", err)
	}

	var albums_artist []models.Album

	for _, album := range albums.Albums {
		albums_artist = append(albums_artist, models.Album{
			Id:   album.ID,
			Name: album.Name,
			Uri:  album.URI,
		})
	}

	var tracks []models.Track

	// get all traks of albums
	for _, album := range albums_artist {
		tracks_album, err := clientSpotify.GetAlbumTracks(ctx, album.Id)
		if err != nil || tracks == nil {
			log.Fatalf("couldn't get album tracks: %v", err)
		}

		// convert object api to my object
		for _, track := range tracks_album.Tracks {
			tracks = append(tracks, models.Track{
				Id:   track.ID,
				Uri:  track.URI,
				Name: track.Name,
			})
		}
	}

	json.NewEncoder(w).Encode(tracks)

}
