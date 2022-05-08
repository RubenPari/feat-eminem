package controllers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/RubenPari/feat-eminem/models"
)

// AuthorizeAccount
// this endpoint redirect to the Spotify login page
// for login and get access token for future endpoint.
func AuthorizeAccount(w http.ResponseWriter, r *http.Request) {
	endpoint := "https://accounts.spotify.com/authorize"
	// TODO: fix
	respAuth, errAuth := http.Get(endpoint + "?response_type=code" +
		"&client_id=" + os.Getenv("CLIENT_ID") +
		"&scope=user-read-private user-read-email" +
		"&redirect_uri=http://localhost:" + os.Getenv("PORT_SERVER") + "/get-access-token" +
		"&state=this is a random string")

	if errAuth != nil {
		log.Fatalln("Error to call endpoint:", endpoint, "\n", errAuth)
	}

	defer respAuth.Body.Close()

	// DEBUG
	res, _ := io.ReadAll(respAuth.Body)
	log.Default().Println(string(res))

	if respAuth.StatusCode == http.StatusOK {
		log.Default().Println("Redirect to GetAccessToken endpoint")
		log.Default().Println("Response information", &r)
		http.Redirect(w, r, "/access-token", http.StatusFound)
	}
}

// GetAccessToken
// this endpoint get the access token from the
// AuthorizeAccount endpoint
func GetAccessToken(w http.ResponseWriter, _ *http.Request) {
	_, _ = w.Write([]byte("GetAccessToken endpoint"))
}

// SearchSongs
// this endpoint call search endpoint from Spotify
// for get all songs with feat. Eminem
func SearchSongs(w http.ResponseWriter, r *http.Request) {
	endpoint := "https://api.spotify.com/v1/search?(feat. Eminem"
	respSearch, errSearch := http.Get(endpoint)

	if errSearch != nil {
		log.Fatalln("Error to call endpoint:", endpoint, "\n", errSearch)
	}

	defer respSearch.Body.Close()

	if respSearch.StatusCode != http.StatusOK {
		log.Fatalln("Error, status code:", respSearch.StatusCode)
	}

	resBody, _ := io.ReadAll(respSearch.Body)

	type ResponseSearch struct {
		tracks []models.Track
	}

	var resObject ResponseSearch

	// convert json returned to object
	err := json.Unmarshal(resBody, &resObject)
	if err != nil {
		log.Fatalln("Error to unmarshal response:", err)
	}

	json.NewEncoder(w).Encode(resObject.tracks)
}
