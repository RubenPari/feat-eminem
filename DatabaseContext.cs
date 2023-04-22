using feat_eminem.Models;
using Microsoft.EntityFrameworkCore;

namespace feat_eminem
{
    public class DatabaseContext : DbContext
    {
        private readonly IConfiguration _config;
        public DbSet<Track>? Tracks { get; set; }

        public DatabaseContext(DbContextOptions<DatabaseContext> options, IConfiguration config) : base(options)
        {
            _config = config;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(_config["ConnectionString"]);
        }
    }
}