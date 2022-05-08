package models

type Show struct {
	Href     string     `json:"href"`
	Items    []struct{} `json:"items"`
	Limit    int        `json:"limit"`
	Next     string     `json:"next"`
	Offset   int        `json:"offset"`
	Previous string     `json:"previous"`
	Total    int        `json:"total"`
}
