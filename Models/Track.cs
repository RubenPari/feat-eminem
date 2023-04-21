using System.ComponentModel.DataAnnotations;

public class Track
{
    [Key]
    [Required]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
    [Required]
    public string Artist { get; set; }
    [Required]
    public string Album { get; set; }
    [Required]
    public string SpotifyUrl { get; set; }
}
