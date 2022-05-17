package models

import (
	"github.com/zmb3/spotify/v2"
	"gorm.io/gorm"
)

// ArtistRelated struct
// represents all artist that have created
// almost one song featuring Eminem
type ArtistRelated struct {
	gorm.Model
	IdSpotify spotify.ID `json:"id_spotify"`
	Name      string     `json:"name"`
	Category  string     `json:"category"`
}
