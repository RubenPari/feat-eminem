package artist

import (
	"bufio"
	"encoding/json"
	"github.com/RubenPari/feat-eminem/database"
	"github.com/RubenPari/feat-eminem/models"
	"github.com/RubenPari/feat-eminem/modules"
	"github.com/zmb3/spotify/v2"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
)

func Add(w http.ResponseWriter, r *http.Request) {
	spotifyClient, ctx := modules.GetSpotifyClient()

	// get name artist
	name := r.URL.Query().Get("name")

	// search artist
	artistApi, err := spotifyClient.Search(ctx, name, spotify.SearchTypeArtist)

	if err != nil || artistApi == nil {
		log.Fatalf("couldn't get artist information: %v", err)
	}

	artist := models.Artist{
		Id:   artistApi.Artists.Artists[0].ID,
		Uri:  artistApi.Artists.Artists[0].URI,
		Name: artistApi.Artists.Artists[0].Name,
	}

	// add artist to file

	// get base directory
	currentDir, _ := os.Getwd()
	filePath := path.Join(currentDir, "artist.csv")

	// create or open file
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		panic(err)
	}

	// check if file was created

	var dataWritten int
	scanner := bufio.NewScanner(file)

	// TODO: doesn't work
	for scanner.Scan() {
		if scanner.Text() == "" {
			// create the first line file csv
			_, _ = file.WriteString("Id," + "Uri," + "Name" + "\n")
			break
		}
	}

	dataWritten, _ = file.WriteString(string(artist.Id) + "," + string(artist.Uri) + "," + artist.Name + "\n")

	_ = file.Close()

	var response map[string]string

	if dataWritten == 0 {
		response = map[string]string{
			"status":  "error",
			"message": "error to write row in file",
		}
	} else {
		response = map[string]string{
			"status":  "success",
			"message": "artist saved on file",
		}
	}

	_ = json.NewEncoder(w).Encode(response)
}

// Modify TODO: change db to file
func Modify(w http.ResponseWriter, r *http.Request) {
	// get artist
	bytesBody, _ := ioutil.ReadAll(r.Body)
	var artist models.ArtistRelated
	err := json.Unmarshal(bytesBody, &artist)
	if err != nil {
		panic(err)
	}

	// edit artist
	edited := database.EditArtist(&artist)
	if edited {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "artist edited",
		})
	} else {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "error to edit artist",
		})
	}
}

// Delete TODO: change db to file
func Delete(w http.ResponseWriter, r *http.Request) {
	// get artist id
	var id = r.URL.Query().Get("id")

	// delete artist
	deleted := database.DeleteArtist(id)
	if deleted {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "artist deleted",
		})
	} else {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "error to delete artist",
		})
	}
}

func GetAllSongs(w http.ResponseWriter, r *http.Request) {
	clientSpotify, ctx := modules.GetSpotifyClient()

	// get name artist
	name := r.URL.Query().Get("name")
	artist, _ := clientSpotify.Search(ctx, name, spotify.SearchTypeArtist)
	artistSpotObj := artist.Artists.Artists[0]

	// get all album of artist
	albums, err := clientSpotify.GetArtistAlbums(ctx, artistSpotObj.ID, []spotify.AlbumType{1, 2})
	if err != nil || albums == nil {
		log.Fatalf("couldn't get artist albums: %v", err)
	}

	var albumsArtist []models.Album

	for _, album := range albums.Albums {
		albumsArtist = append(albumsArtist, models.Album{
			Id:   album.ID,
			Name: album.Name,
			Uri:  album.URI,
		})
	}

	var tracks []models.Track

	// get all tracks of albums
	for _, album := range albumsArtist {
		tracksAlbum, err := clientSpotify.GetAlbumTracks(ctx, album.Id)
		if err != nil || tracksAlbum == nil {
			log.Fatalf("couldn't get album tracks: %v", err)
		}

		// convert object api to my object
		for _, track := range tracksAlbum.Tracks {
			tracks = append(tracks, models.Track{
				Id:   track.ID,
				Uri:  track.URI,
				Name: track.Name,
			})
		}
	}

	_ = json.NewEncoder(w).Encode(tracks)

}
