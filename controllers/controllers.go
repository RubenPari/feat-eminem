package controllers

import (
	"log"
	"net/http"
	"os"
)

// AuthorizeAccount
// this endpoint redirect to the Spotify login page
// for login and get access token for future endpoint.
func AuthorizeAccount(w http.ResponseWriter, r *http.Request) {
	endpoint := "https://accounts.spotify.com/authorize"
	respAuth, errAuth := http.Get(endpoint + "?response_type=code" +
		"&client_id=" + os.Getenv("CLIENT_ID") +
		"&scope=user-read-private user-read-email" +
		"&redirect_uri=http://localhost:4000" +
		"&state=this is a random string")

	if errAuth != nil {
		log.Fatalln("Error to call endpoint:", endpoint, "\n", errAuth)
	}

	if respAuth.StatusCode == http.StatusOK {
		log.Default().Println("Redirect to GetAccessToken endpoint")
		log.Default().Println("Response information", &r)
		http.Redirect(w, r, "/access-token", http.StatusFound)
	}
}

// GetAccessToken
// this endpoint get the access token from the
// AuthorizeAccount endpoint
func GetAccessToken(w http.ResponseWriter, r *http.Request) {
	_, _ = w.Write([]byte("GetAccessToken endpoint"))
}
