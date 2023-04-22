using System.Net.Http.Headers;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace feat_eminem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly string _baseUrlAuth;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _redirectUri;
        private readonly string _scopes;
        private readonly string _baseUrlToken;

        public AuthController()
        {
            _baseUrlAuth = Environment.GetEnvironmentVariable("BASE_URL_AUTH")!;
            _clientId = Environment.GetEnvironmentVariable("CLIENT_ID")!;
            _clientSecret = Environment.GetEnvironmentVariable("CLIENT_SECRET")!;
            _redirectUri = Environment.GetEnvironmentVariable("REDIRECT_URI")!;
            _scopes = Environment.GetEnvironmentVariable("SCOPES")!;
            _baseUrlToken = Environment.GetEnvironmentVariable("BASE_URL_TOKEN")!;
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            // generate random state
            var state = Guid.NewGuid().ToString("N");

            // save state in the session
            HttpContext.Session.SetString("State", state);

            // create the url for authentication spotify and redirect to it
            var url = _baseUrlAuth +
                      "?client_id=" + _clientId +
                      "&response_type=code" +
                      "&redirect_uri=" + _redirectUri +
                      "&scope=" + _scopes +
                      "&state" + state;

            return Redirect(url);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback(string code, string state)
        {
            // check if the state is the same as the one generated in the login method
            if (state != HttpContext.Session.GetString("State"))
            {
                return BadRequest("State is not valid");
            }

            // create request to get the token
            var client = new HttpClient();

            // set up form data like: code, redirect_uri, client_id, client_secret, grant_type
            var form = new Dictionary<string, string>
            {
                { "code", code },
                { "redirect_uri", _redirectUri },
                { "grant_type", "authorization_code" }
            };

            // set up headers like: Authorization
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Basic",
                Convert.ToBase64String(
                    Encoding.UTF8.GetBytes(
                        $"{_clientId}:{_clientSecret}")));

            // send request
            var response = await client.PostAsync(_baseUrlToken, new FormUrlEncodedContent(form));

            // read response
            var responseString = await response.Content.ReadAsStringAsync();

            // get 'access_token' from response
            var accessToken = JObject.Parse(responseString)["access_token"]!
                .ToString();

            // save access token in the session
            HttpContext.Session.SetString("AccessToken", accessToken);

            return Ok("Logged in successfully");
        }
    }
}