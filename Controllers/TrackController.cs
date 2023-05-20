using feat_eminem.Lib.Client;

namespace feat_eminem.Controllers;

using Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("[controller]")]
public class TrackController : ControllerBase
{
    private readonly DatabaseContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<TrackController> _logger;

    public TrackController(DatabaseContext db, IConfiguration config, ILogger<TrackController> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    [HttpPost("add/{id}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddAsync(string id)
    {
        var trackClient = new TrackClient(HttpContext.Session.GetString("AccessToken")!, _config);

        var trackJson = await trackClient.GetOne(id);

        _logger.LogInformation("Track: {Track}", trackJson);

        await _db.Tracks!.AddAsync(new Track
        {
            Id = trackJson["id"]!.ToString(),
            Name = trackJson["name"]!.ToString(),
            Artist = trackJson["artists"]![0]!["name"]!.ToString(),
            Album = trackJson["album"]!["name"]!.ToString(),
            SpotifyUrl = trackJson["external_urls"]!["spotify"]!.ToString()
        });

        var saved = await _db.SaveChangesAsync();

        if (saved == 0)
        {
            return BadRequest("Track could not be saved");
        }

        _logger.LogInformation("Track saved successfully");

        return Created("Track added successfully", trackJson["id"]!.ToString());
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

        _logger.LogInformation("Track: {Track}", track);

        return Ok(track);
    }

    [HttpGet("get-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAsync()
    {
        object?[] tracks = await _db.Tracks!.ToArrayAsync();

        _logger.LogInformation("Tracks: {Tracks}", tracks);

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

        _logger.LogInformation("Track found: {Track}", track);

        _db.Tracks!.Remove(track);

        var deleted = await _db.SaveChangesAsync();

        if (deleted == 0)
        {
            return BadRequest("Track could not be deleted");
        }

        _logger.LogInformation("Track deleted successfully");

        return Ok("Track deleted successfully");
    }

    [HttpGet("get-all/artist/{artistId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAllByArtistAsync(string artistId)
    {
        object?[] tracks = await _db.Tracks!.Where(t => t.Id == artistId).ToArrayAsync();

        if (tracks.Length == 0)
        {
            return NotFound("Tracks with given artist id not found");
        }

        _logger.LogInformation("Tracks: {Tracks}", tracks);

        return Ok(tracks);
    }

    [HttpGet("get-all/popular/{score:int}")]
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

        var trackFilter = tracks.Where(track => track.Popularity >= score).ToList();

        _logger.LogInformation("Filtered tracks: {Tracks}", trackFilter);

        if (trackFilter.Count == 0)
        {
            return NotFound("Tracks with given popularity not found");
        }

        return Ok(trackFilter);
    }
}