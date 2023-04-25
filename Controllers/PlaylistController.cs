using feat_eminem.Lib.Client;
using Microsoft.AspNetCore.Mvc;

namespace feat_eminem.Controllers;

[ApiController]
[Route("[controller]")]
public class PlaylistController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly DatabaseContext _db;

    public PlaylistController(IConfiguration config, DatabaseContext db)
    {
        _config = config;
        _db = db;
    }

    /**
     * Delete all tracks in
     * specified playlist
     */
    [HttpDelete("clear-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public Task<IActionResult> ClearAll()
    {
        var clientPlaylist = new PlaylistClient(HttpContext.Session.GetString("AccessToken")!, _config);

        var deletedTracks = clientPlaylist.DeleteAll();

        return !deletedTracks
            ? Task.FromResult<IActionResult>(BadRequest("Tracks could not be deleted"))
            : Task.FromResult<IActionResult>(Ok("Tracks deleted"));
    }

    /**
     * sync all tracks saved
     * in database with
     * specified playlist
     */
    [HttpPut("sync")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Sync()
    {
        var clientPlaylist = new PlaylistClient(HttpContext.Session.GetString("AccessToken")!, _config);

        var deletedTracks = clientPlaylist.DeleteAll();

        if (!deletedTracks)
        {
            return BadRequest("Tracks could not be deleted");
        }

        // get all tracks from database
        var tracks = _db.Tracks!.ToArray();

        var addedTracks = clientPlaylist.AddAll(tracks);

        return !addedTracks
            ? BadRequest("Tracks could not be added")
            : Ok("Tracks added");
    }
}