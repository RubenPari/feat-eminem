package main

import (
	"github.com/RubenPari/feat-eminem/routes"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

func main() {
	// Load env variables
	dotenv := godotenv.Load()
	if dotenv != nil {
		panic("Error loading .env file")
	}

	server := http.ListenAndServe(":"+os.Getenv("PORT_SERVER"), routers.GetRouter())
	if server != nil {
		log.Fatal("Error starting server: ", server)
	}
}
