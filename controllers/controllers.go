package controllers

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

func SearchSongs(w http.ResponseWriter, _ *http.Request) {
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

	// search all songs
	allSongs, err := clientSpotify.Search(ctx, "Eminem", spotify.SearchTypeTrack)

	if err != nil || allSongs == nil {
		log.Fatalf("couldn't get all songs: %v", err)
	}

	var songs []models.Track

	// remove Eminem songs
	for _, trak := range allSongs.Tracks.Tracks {
		if trak.Artists[0].Name != "Eminem" {
			songs = append(songs, models.Track{
				Id:   string(trak.ID),
				Href: string(trak.URI),
				Name: trak.Name,
			})
		}
	}

	json.NewEncoder(w).Encode(songs)
}
