package models

import "github.com/zmb3/spotify/v2"

type Track struct {
	Id   spotify.ID  `json:"id"`
	Uri  spotify.URI `json:"uri"`
	Name string      `json:"name"`
}
