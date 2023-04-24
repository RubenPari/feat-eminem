using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json.Linq;

namespace feat_eminem.Lib.Client;

public class Playlist
{
    private readonly IConfiguration? _config;
    private readonly HttpClient? _client;
    
    private Playlist(string accessToken, IConfiguration? config)
    {
        _config = config;

        // initialize client
        _client = new HttpClient();

        // set-up header Bearer
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );
    }
    
    public JObject GetAll(string idPlaylist)
    {
        // set-up url
        var url = _config!["BaseUrl"] + "/playlists/" + idPlaylist + "/tracks";

        var response = _client!.GetAsync(url).Result;

        if (!response.IsSuccessStatusCode)
        {
            return JObject.Parse("{'error': 'Could not get tracks from playlist'}");
        }

        var stringResponse = response.Content.ReadAsStringAsync().Result;

        return JObject.Parse(stringResponse);
    }


    /**
     * Delete all tracks in
     * specified playlist
     * given by id
     */
    public bool DeleteAll(string id)
    {
        // get all track from playlist with myself class method
        var tracksJson = GetAll(id)["items"]!;

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

        var url = _config!["BaseUrl"] + "/playlists/" + id + "/tracks";
        
        var requestDeleteTracks = new HttpRequestMessage
        {
            Method = HttpMethod.Delete,
            RequestUri = new Uri(url),
            Content = new StringContent(requestBody.ToString(), Encoding.UTF8, "application/json")
        };
        
        var responseDeleteTracks = _client!.SendAsync(requestDeleteTracks).Result;
        
        return responseDeleteTracks.IsSuccessStatusCode;
    }
}