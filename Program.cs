using feat_eminem.Middlewares;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Host.UseSerilog((context, configuration) => { configuration.ReadFrom.Configuration(context.Configuration); });

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCheckAuthMiddleware();

app.UseSerilogRequestLogging();

app.MapControllers();

app.UseSession();

app.Run();