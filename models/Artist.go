package models

import "github.com/zmb3/spotify/v2"

type Artist struct {
	Id   spotify.ID  `json:"id"`
	Name string      `json:"name"`
	Uri  spotify.URI `json:"uri"`
}
