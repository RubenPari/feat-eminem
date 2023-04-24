using System.Net.Http.Headers;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace feat_eminem.Controllers;

[ApiController]
[Route("[controller]")]
public class PlaylistController : ControllerBase
{
    private readonly IConfiguration _config;

    public PlaylistController(IConfiguration config)
    {
        _config = config;
    }

    /**
     * Delete all tracks in
     * specified playlist
     */
    [HttpDelete("clear-all")]
    public async Task<IActionResult> ClearAll()
    {
        var accessToken = HttpContext.Session.GetString("AccessToken")!;

        var client = new HttpClient();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );

        var urlGetTracks = _config["BaseUrl"] + "/playlists/" + _config["PlaylistId"] + "/tracks";

        // get all from playlist
        var responseGetTracks = await client.GetAsync(urlGetTracks);

        if (!responseGetTracks.IsSuccessStatusCode)
        {
            return BadRequest("Could not get tracks from playlist");
        }

        var stringResponseGetTracks = await responseGetTracks.Content.ReadAsStringAsync();

        var jsonResponseGetTracks = JObject.Parse(stringResponseGetTracks);

        var tracksJson = jsonResponseGetTracks["items"]!;

        // create request body in json format for delete request
        var tracks = new JArray();

        foreach (var track in tracksJson)
        {
            tracks.Add(new JObject
            {
                { "uri", track["track"]!["uri"]! }
            });
        }

        var requestBody = new JObject
        {
            { "tracks", tracks }
        };

        var urlDeleteTracks = _config["BaseUrl"] + "/playlists/" + _config["PlaylistId"] + "/tracks";

        var content = new StringContent(requestBody.ToString(), Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Delete, urlDeleteTracks)
        {
            Content = content,
            Method = HttpMethod.Delete,
            RequestUri = new Uri(urlDeleteTracks)
        };
        
        var responseDeleteTracks = await client.SendAsync(request);
        
        if (!responseDeleteTracks.IsSuccessStatusCode)
        {
            return BadRequest("Could not delete tracks from playlist");
        }
        
        return Ok("Tracks deleted from playlist");
    }
}