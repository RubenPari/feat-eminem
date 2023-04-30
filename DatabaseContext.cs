using feat_eminem.Models;
using Microsoft.EntityFrameworkCore;

namespace feat_eminem;

public class DatabaseContext : DbContext
{
    public DbSet<Track>? Tracks { get; set; }

    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL(Environment.GetEnvironmentVariable("MYSQL_CONNECTION_STRING")!);
    }
}