namespace feat_eminem.Middlewares;

public class CheckAuth
{
    private readonly RequestDelegate _next;

    public CheckAuth(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // check if request is for /auth/login, /auth/callback or /auth/logout
        if (context.Request.Path.StartsWithSegments("/auth/login") ||
            context.Request.Path.StartsWithSegments("/auth/callback") ||
            context.Request.Path.StartsWithSegments("/auth/logout"))
        {
            await _next(context);
            return;
        }

        // check if access token is set
        if (context.Session.GetString("AccessToken") == null)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized");
        }

        await _next(context);
    }
}

public static class CheckAuthExtensions
{
    public static IApplicationBuilder UseCheckAuthMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<CheckAuth>();
    }
}