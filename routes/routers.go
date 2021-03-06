package routers

import (
	"net/http"

	"github.com/RubenPari/feat-eminem/controllers/artist"
)

func GetRouter() *http.ServeMux {
	// Create a new ServeMux
	mux := http.NewServeMux()

	mux.HandleFunc("/artists/add", artist.Add)
	mux.HandleFunc("/artists/getAllSongs", artist.GetAllSongs)

	// Return the ServeMux
	return mux
}
