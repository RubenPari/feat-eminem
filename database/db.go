package database

import (
	"github.com/RubenPari/feat-eminem/models"
	"github.com/zmb3/spotify/v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func GetDb() *gorm.DB {
	db, _ = gorm.Open(sqlite.Open("./feat-eminem.db"))

	// Migrate all schema
	_ = db.AutoMigrate(&models.ArtistRelated{})

	return db
}

func AddArtist(artist *models.ArtistRelated) bool {
	db.Create(artist)
	return true
}

func removeArtist(id spotify.ID) bool {
	var founded models.ArtistRelated

	db.Find(&founded, id)

	if founded.ID == 0 {
		return false
	} else {
		db.Delete(founded)
		return true
	}
}

func EditArtist(artist *models.ArtistRelated) bool {
	var founded models.ArtistRelated

	db.Find(&founded, artist.ID)

	if founded.ID == 0 {
		return false
	} else {
		db.Model(&founded).Updates(artist)
		return true
	}
}

func DeleteArtist(id string) bool {
	var founded models.ArtistRelated

	db.Find(&founded, id)

	if founded.ID == 0 {
		return false
	} else {
		db.Delete(founded)
		return true
	}
}
