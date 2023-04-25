using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;

namespace feat_eminem.Lib.Client;

public class TrackClient
{
    private readonly IConfiguration? _config;
    private readonly string _accessToken;

    public TrackClient(string accessToken, IConfiguration? config)
    {
        _config = config;
        _accessToken = accessToken;

        // initialize client
        var client = new HttpClient();

        // set-up header Bearer
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );
    }

    public async Task<JArray> GetOne(string id)
    {
        var client = new HttpClient();

        // set up headers
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            _accessToken
        );

        var url = _config!["BaseUrl"] + "/tracks/" + id;

        var response = await client.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            return JArray.Parse("[{'error': 'Track could not be added'}]");
        }

        var stringResponse = await response.Content.ReadAsStringAsync();

        var jsonResponse = JObject.Parse(stringResponse);

        // check if track 'external_urls' is null
        if (jsonResponse["external_urls"] != null)
        {
            return JArray.Parse("[{'error': 'Track could not be added'}]");
        }

        return JArray.Parse(stringResponse);
    }
}