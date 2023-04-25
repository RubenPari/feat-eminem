using System.Net.Http.Headers;
using System.Text;
using feat_eminem.Models;
using Newtonsoft.Json.Linq;

namespace feat_eminem.Lib.Client;

/**
 * Thi class operate to a specify
 * playlist setter in appsettings.json
 * or environment variables
 */
public class PlaylistClient
{
    private readonly IConfiguration? _config;
    // id pre-selected
    private readonly string? _id;
    private readonly HttpClient? _client;

    public PlaylistClient(string accessToken, IConfiguration? config)
    {
        _config = config;
        _id = _config!["PlaylistId"];

        // initialize client
        _client = new HttpClient();

        // set-up header Bearer
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );
    }

    private JArray GetAll()
    {
        var totalTracks = new JArray();

        const int limit = 50;
        var offset = 0;

        string stringResponse;

        do
        {
            // set-up url with limit and offset
            var url = _config!["BaseUrl"] + "/playlists/" + _id + "/tracks" + "?limit=" + limit + "&offset=" +
                      offset;

            var response = _client!.GetAsync(url).Result;

            if (!response.IsSuccessStatusCode)
            {
                // return an array with 1 element
                // with error message
                return new JArray
                {
                    new JObject
                    {
                        { "error", "Could not get tracks from playlist" }
                    }
                };
            }

            stringResponse = response.Content.ReadAsStringAsync().Result;

            // add partial tracks to totalTracks
            totalTracks.Merge(JObject.Parse(stringResponse)["items"]!);

            // increment offset
            offset += limit;
        } while (offset < JObject.Parse(stringResponse)["total"]!.Value<int>());

        return totalTracks;
    }

    /**
     * Delete all tracks in
     * specified playlist
     * given by id
     */
    public bool DeleteAll()
    {
        // get all track from playlist with myself class method
        var tracksTotal = GetAll();

        const int limit = 100;
        var offset = 0;

        // create an array with 100 tracks and
        // offset 0, 100, 200, 300, ...
        do
        {
            var tracksPartial = new JArray();

            // add 100 tracks to tracksPartial
            var i = offset;
            while (i < limit + offset)
            {
                if (tracksTotal.Count == 0)
                {
                    break;
                }

                tracksPartial.Add(tracksTotal[i]);
                tracksTotal.RemoveAt(i);

                i++;
            }

            // create request body in json format for delete request
            var tracksBody = new JArray();

            foreach (var track in tracksPartial)
            {
                tracksBody.Add(new JObject
                {
                    { "uri", track["track"]!["uri"]! }
                });
            }

            var requestBody = new JObject
            {
                { "tracks", tracksBody }
            };

            var url = _config!["BaseUrl"] + "/playlists/" + _id + "/tracks";

            var requestDeleteTracks = new HttpRequestMessage
            {
                Method = HttpMethod.Delete,
                RequestUri = new Uri(url),
                Content = new StringContent(requestBody.ToString(), Encoding.UTF8, "application/json")
            };

            var responseDeleteTracks = _client!.SendAsync(requestDeleteTracks).Result;

            if (!responseDeleteTracks.IsSuccessStatusCode)
            {
                return false;
            }

            offset += limit;
        } while (tracksTotal.Count > 0);

        return true;
    }

    public bool AddAll(Track[] tracks)
    {
        const int limit = 100;
        var offset = 0;

        // create an array with 100 tracks and
        // offset 0, 100, 200, 300, ...
        do
        {
            var tracksPartial = new JArray();

            // add 100 tracks to tracksPartial
            var i = offset;
            while (i < limit + offset)
            {
                if (tracks.Length == 0)
                {
                    break;
                }

                tracksPartial.Add(new JObject
                {
                    { "uri", tracks[i].SpotifyUrl }
                });

                i++;
            }

            // create request body in json format for delete request
            var tracksBody = new JArray();

            foreach (var track in tracksPartial)
            {
                tracksBody.Add(new JObject
                {
                    { "uri", track["track"]!["uri"]! }
                });
            }

            var requestBody = new JObject
            {
                { "tracks", tracksBody }
            };

            var url = _config!["BaseUrl"] + "/playlists/" + _id + "/tracks";

            var requestAddTracks = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(url),
                Content = new StringContent(requestBody.ToString(), Encoding.UTF8, "application/json")
            };

            var responseAddTracks = _client!.SendAsync(requestAddTracks).Result;

            if (!responseAddTracks.IsSuccessStatusCode)
            {
                return false;
            }

            offset += limit;
        } while (tracks.Length > 0);

        return true;
    }
}