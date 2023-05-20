using System.ComponentModel.DataAnnotations;

namespace feat_eminem.Models;

public class Track
{
    [Key] [Required] public string? Id { get; set; }
    [Required] public string? Name { get; set; }
    [Required] public string? Artist { get; set; }
    [Required] public string? Album { get; set; }
    [Required] public string? SpotifyUrl { get; set; }
    [Required] public int? Popularity { get; set; }

    public override string ToString()
    {
        return "Track: " + Name + " - " + Artist + " - " + Album + " - " + SpotifyUrl + " - " + Popularity;
    }
}