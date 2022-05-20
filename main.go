package main

import (
	"log"
	"net/http"
	"os"

	routers "github.com/RubenPari/feat-eminem/routes"
)

func main() {

	server := http.ListenAndServe(":"+os.Getenv("PORT_SERVER"), routers.GetRouter())
	if server != nil {
		log.Fatal("Error starting server: ", server)
	}
}
