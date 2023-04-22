using feat_eminem.Models;
using Microsoft.AspNetCore.Mvc;
using SpotifyAPI.Web;

namespace feat_eminem.Controllers
{
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
            // TODO: mapped middleware for check if the user is logged in

            var spotify = new SpotifyClient(
                HttpContext.Session.GetString("AccessToken")!);

            var track = await spotify.Tracks.Get(id);

            if (track == null)
            {
                return NotFound("Track with given id not found");
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
    }
}