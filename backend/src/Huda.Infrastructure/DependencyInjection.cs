using Huda.Application.Import;
using Huda.Domain;
using Huda.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Huda.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// The repositories on PostgreSQL (ConnectionStrings:Huda) and the site's data files as the content's source.
    /// Settings are read when first needed, so a host's later configuration, such as a test's, still counts.
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<HudaDbContext>((provider, options) => options
            .UseNpgsql(provider.GetRequiredService<IConfiguration>().GetConnectionString("Huda")
                ?? throw new InvalidOperationException("Set the connection string ConnectionStrings:Huda."))
            .UseSnakeCaseNamingConvention()
            .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IContentSource>(provider => new SiteContentSource(provider.GetRequiredService<IConfiguration>().SiteFolder()));
        return services;
    }

    /// <summary>Whether the database answers.</summary>
    public static IHealthChecksBuilder AddDatabase(this IHealthChecksBuilder checks) => checks.AddDbContextCheck<HudaDbContext>("database");

    /// <summary>Creates the database if there is none, and brings its schema up to date.</summary>
    public static async Task MigrateDatabaseAsync(this IServiceProvider services, CancellationToken cancellationToken = default)
    {
        // A missing database, or one without EF's migrations table yet (as Docker's PostgreSQL creates it), would
        // otherwise show up as failed connections and commands in the log, though the migration goes on fine.
        var database = services.GetRequiredService<HudaDbContext>().Database;
        var creator = database.GetService<IRelationalDatabaseCreator>();
        if (!await creator.ExistsAsync(cancellationToken))
            await creator.CreateAsync(cancellationToken);
        await database.GetService<IHistoryRepository>().CreateIfNotExistsAsync(cancellationToken);
        await database.MigrateAsync(cancellationToken);
    }

    /// <summary>
    /// The site's public folder, with data/ and images/: Site:Public, or else the one in the clone of the repo
    /// this runs in.
    /// </summary>
    public static string SiteFolder(this IConfiguration configuration)
    {
        if (configuration["Site:Public"] is { Length: > 0 } folder)
            return Path.GetFullPath(folder);
        for (var repo = new DirectoryInfo(AppContext.BaseDirectory); repo is not null; repo = repo.Parent)
        {
            if (File.Exists(Path.Combine(repo.FullName, "public", "data", "ayat.json")))
                return Path.Combine(repo.FullName, "public");
        }
        throw new InvalidOperationException("Set Site:Public to the site's public folder: this isn't running in a clone of the repo.");
    }
}
