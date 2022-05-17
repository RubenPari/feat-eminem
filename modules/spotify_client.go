package modules

import (
	"context"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/oauth2/clientcredentials"
	"log"
	"os"
)

func GetSpotifyClient() (*spotify.Client, context.Context) {

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
	return spotify.New(httpClient), ctx
}
