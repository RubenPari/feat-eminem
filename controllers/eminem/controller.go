package eminem

import (
	"bufio"
	"github.com/RubenPari/feat-eminem/modules"
	"net/http"
	"os"
	"strings"
)

// GetAllSongs return all songs featuring eminem as json response TODO: implement
func GetAllSongs(_ http.ResponseWriter, _ *http.Request) {
}

func GetAllSongsArtistFeatured(_ http.ResponseWriter, _ *http.Request) {
	// get spotifyClient object
	spotifyClient, ctx := modules.GetSpotifyClient()

	// read the file
	file, err := os.OpenFile(modules.GetFilePath(), os.O_APPEND, 0755)
	if err != nil {
		panic(err)
	}

	fileScanner := bufio.NewScanner(file)

	var rows []string

	for fileScanner.Scan() {
		row := fileScanner.Text()
		rows = append(rows, row)
	}

	_ = file.Close()

	for _, row := range rows {

		var rowData = strings.Split(row, ",")

		id := rowData[0]
		name := rowData[1]
		category := rowData[2]

		// get artist spotify object
		artist, err := spotifyClient.GetArtistAlbums(ctx, id)

		// get the featured artists
		featuredArtists := modules.GetFeaturedArtists(spotifyClient, ctx, artist)

		// get the songs
		songs := modules.GetSongs(spotifyClient, ctx, featuredArtists)

		// write the songs to file
		modules.WriteSongsToFile(songs)
	}
}
