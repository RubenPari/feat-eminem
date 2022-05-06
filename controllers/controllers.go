package controllers

import "net/http"

func Index(w http.ResponseWriter, _ *http.Request) {
	_, _ = w.Write([]byte("Hello World"))
}

func Login(w http.ResponseWriter, r *http.Request) {
	// call the endpoint for login the user
	endpoint := "https://api.spotify.com/v1/me"
	_, _ = http.Get(endpoint)
}
