using Microsoft.EntityFrameworkCore;

namespace feat_eminem.Controllers;

using Models;
using Microsoft.AspNetCore.Mvc;
using SpotifyAPI.Web;

[ApiController]
[Route("[controller]")]
public class TrackController : ControllerBase
{
    private readonly DatabaseContext _db;

    public TrackController(DatabaseContext db)
    {
        _db = db;
    }

    [HttpPost("add/{id}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddAsync(string id)
    {
        var spotify = new SpotifyClient(
            HttpContext.Session.GetString("AccessToken")!);

        var track = await spotify.Tracks.Get(id);

        // check if url parameter is valid
        // for make sure that the track is
        // valid
        if (!track.Uri.Contains("https://open.spotify.com/track/"))
        {
            return BadRequest("Track with given id not found");
        }

        // save track to db
        await _db.Tracks!.AddAsync(new Track
        {
            Id = track.Id,
            Name = track.Name,
            Artist = track.Artists[0].Name,
            Album = track.Album.Name,
            SpotifyUrl = track.ExternalUrls["spotify"]
        });

        var saved = await _db.SaveChangesAsync();

        if (saved == 0)
        {
            return BadRequest("Track could not be saved");
        }

        return Created("Track added successfully", track);
    }

    [HttpGet("get/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAsync(string id)
    {
        var track = await _db.Tracks!.FindAsync(id);

        if (track == null)
        {
            return NotFound("Track with given id not found");
        }

        return Ok(track);
    }

    [HttpGet("get-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAsync()
    {
        var tracks = await _db.Tracks!.ToArrayAsync();

        return Ok(tracks);
    }

    [HttpDelete("delete/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(string id)
    {
        var track = await _db.Tracks!.FindAsync(id);

        if (track == null)
        {
            return NotFound("Track with given id not found");
        }

        _db.Tracks!.Remove(track);

        var deleted = await _db.SaveChangesAsync();

        if (deleted == 0)
        {
            return BadRequest("Track could not be deleted");
        }

        return Ok("Track deleted successfully");
    }

    [HttpGet("get-all/artist/{artistId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAllByArtistAsync(string artistId)
    {
        var tracks = await _db.Tracks!.Where(t => t.Id == artistId).ToArrayAsync();

        if (tracks.Length == 0)
        {
            return NotFound("Tracks with given artist id not found");
        }

        return Ok(tracks);
    }

    [HttpGet("get-all/popular/{score}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAllPopularAsync(int score)
    {
        // check if popularity param is valid
        if (score is < 0 or > 100)
        {
            return BadRequest("Popularity param must be between 0 and 100");
        }

        var tracks = await _db.Tracks!.ToArrayAsync();

        var trackFilter = new List<Track>();

        var spotify = new SpotifyClient(
            HttpContext.Session.GetString("AccessToken")!);

        // filter all tracks in db by popularity param
        foreach (var trackDb in tracks)
        {
            var track = await spotify.Tracks.Get(trackDb.Id!);

            if (track.Popularity >= score)
            {
                trackFilter.Add(trackDb);
            }
        }

        if (trackFilter.Count == 0)
        {
            return NotFound("Tracks with given popularity not found");
        }

        return Ok(trackFilter);
    }
}