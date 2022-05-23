package modules

import (
	"bufio"
	"github.com/RubenPari/feat-eminem/models"
	"os"
	"path"
)

func GetFilePath() string {
	currentDir, _ := os.Getwd()
	return path.Join(currentDir, "related-artist.csv")
}

func AddArtist(artist *models.ArtistRelated) bool {
	// open file with append mode
	file, err := os.OpenFile(GetFilePath(), os.O_APPEND, 0755)
	if err != nil {
		panic(err)
	}

	dataWritten, errWrite := file.WriteString(string(artist.Id) + "," + artist.Name + "," + artist.Category[0] + "\n")
	if dataWritten == 0 || errWrite != nil {
		panic("Data written successfully")
	}

	_ = file.Close()

	return true
}

func DeleteArtist(id string) bool {
	// open file with append mode
	file, err := os.OpenFile(GetFilePath(), os.O_RDWR, 0755)
	if err != nil {
		panic(err)
	}

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if line != id {
			lines = append(lines, line)
		}
	}

	_ = file.Truncate(0)
	_, _ = file.Seek(0, 0)

	for _, line := range lines {
		_, err = file.WriteString(line + "\n")
		if err != nil {
			panic("Data written successfully")
		}
	}

	_ = file.Close()

	return true
}

func EditArtist(artist *models.ArtistRelated) bool {
	// open file with append mode
	file, err := os.OpenFile(GetFilePath(), os.O_RDWR, 0755)
	if err != nil {
		panic(err)
	}

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if line == string(artist.Id) {
			line = string(artist.Id) + "," + artist.Name + "," + artist.Category[0] + "\n"
		}
	}

	_ = file.Close()

	return true
}
