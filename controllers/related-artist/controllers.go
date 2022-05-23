package related_artist

import (
	"encoding/json"
	"github.com/RubenPari/feat-eminem/models"
	"github.com/RubenPari/feat-eminem/modules"
	"github.com/zmb3/spotify/v2"
	"io/ioutil"
	"log"
	"net/http"
)

func Add(w http.ResponseWriter, r *http.Request) {
	spotifyClient, ctx := modules.GetSpotifyClient()

	// get name related-artist
	name := r.URL.Query().Get("name")

	// search related-artist
	artistApi, err := spotifyClient.Search(ctx, name, spotify.SearchTypeArtist)

	if err != nil || artistApi == nil {
		log.Fatalf("couldn't get related-artist information: %v", err)
	}

	artist := models.ArtistRelated{
		Id:       artistApi.Artists.Artists[0].ID,
		Name:     artistApi.Artists.Artists[0].Name,
		Category: artistApi.Artists.Artists[0].Genres,
	}

	written := modules.AddArtist(&artist)

	var response map[string]string

	if written {
		response = map[string]string{
			"status":  "success",
			"message": "related-artist saved on file",
		}
	} else {
		response = map[string]string{
			"status":  "error",
			"message": "error to write row in file",
		}
	}

	_ = json.NewEncoder(w).Encode(response)
}

func Modify(w http.ResponseWriter, r *http.Request) {
	// get related-artist
	bytesBody, _ := ioutil.ReadAll(r.Body)
	var artist models.ArtistRelated
	err := json.Unmarshal(bytesBody, &artist)
	if err != nil {
		panic(err)
	}

	edited := modules.EditArtist(&artist)

	if edited {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "related-artist edited",
		})
	} else {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "error to edit related-artist",
		})
	}
}

func Delete(w http.ResponseWriter, r *http.Request) {
	// get related-artist id
	var id = r.URL.Query().Get("id")

	deleted := modules.DeleteArtist(id)

	if deleted {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "related-artist deleted",
		})
	} else {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "error to delete related-artist",
		})
	}
}

func GetAllSongs(w http.ResponseWriter, r *http.Request) {
	clientSpotify, ctx := modules.GetSpotifyClient()

	// get name related-artist
	name := r.URL.Query().Get("name")
	artist, _ := clientSpotify.Search(ctx, name, spotify.SearchTypeArtist)
	artistSpotObj := artist.Artists.Artists[0]

	// get all album of related-artist
	albums, err := clientSpotify.GetArtistAlbums(ctx, artistSpotObj.ID, []spotify.AlbumType{1, 2})
	if err != nil || albums == nil {
		log.Fatalf("couldn't get related-artist albums: %v", err)
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
