package routers

import (
	"github.com/RubenPari/feat-eminem/controllers/eminem"
	"net/http"

	"github.com/RubenPari/feat-eminem/controllers/related-artist"
)

func GetRouter() *http.ServeMux {
	// Create a new ServeMux
	mux := http.NewServeMux()

	mux.HandleFunc("/related-artists/add", related_artist.Add)
	mux.HandleFunc("/eminem/getAllSongs", eminem.GetAllSongs)

	// Return the ServeMux
	return mux
}
