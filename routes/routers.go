package routers

import (
	"net/http"

	"github.com/RubenPari/feat-eminem/controllers"
)

func GetRouter() *http.ServeMux {
	// Create a new ServeMux
	mux := http.NewServeMux()

	mux.HandleFunc("/search-songs", controllers.SearchSongs)

	// Return the ServeMux
	return mux
}
