package main

import (
	"log"
	"net/http"
	"os"

	routers "github.com/RubenPari/feat-eminem/routes"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	server := http.ListenAndServe(":"+os.Getenv("PORT_SERVER"), routers.GetRouter())
	if server != nil {
		log.Fatal("Error starting server: ", server)
	}
}
