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
        private readonly IConfiguration _config;

        public AuthController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            // generate random state
            var state = Guid.NewGuid().ToString("N");

            // save state in the session
            HttpContext.Session.SetString("State", state);

            // create the url for authentication spotify and redirect to it
            var url = _config["BaseUrlAuth"] +
                      "?client_id=" + _config["ClientId"] +
                      "&response_type=code" +
                      "&redirect_uri=" + _config["RedirectUri"] +
                      "&scope=" + _config["Scopes"] +
                      "&state" + state;

            return Redirect(url);
        }

        [HttpGet("callback")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
                { "redirect_uri", _config["RedirectUri"]! },
                { "grant_type", "authorization_code" }
            };

            // set up headers like: Authorization
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Basic",
                Convert.ToBase64String(
                    Encoding.UTF8.GetBytes(
                        $"{_config["ClientId"]}:{_config["ClientSecret"]}")));

            // send request
            var response = await client.PostAsync(_config["BaseUrlToken"], new FormUrlEncodedContent(form));

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