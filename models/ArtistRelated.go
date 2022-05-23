package models

import (
	"github.com/zmb3/spotify/v2"
)

// ArtistRelated struct
// represents all related-artist that have created
// almost one song featuring Eminem
type ArtistRelated struct {
	Id       spotify.ID `json:"id_spotify"`
	Name     string     `json:"name"`
	Category []string   `json:"category"`
}
