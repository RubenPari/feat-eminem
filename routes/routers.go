package routers

import (
	"github.com/RubenPari/feat-eminem/controllers"
	"net/http"
)

func GetRouter() *http.ServeMux {
	// Create a new ServeMux
	mux := http.NewServeMux()

	// INDEX => /
	mux.HandleFunc("/", controllers.Index)

	// Return the ServeMux
	return mux
}
