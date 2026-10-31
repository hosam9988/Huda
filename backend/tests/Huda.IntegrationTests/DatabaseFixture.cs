using Huda.Application.Import;
using Huda.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Huda.IntegrationTests;

/// <summary>
/// A database of its own, migrated and filled with the site's real content as the migrator does it, and the API
/// running on it. The tests that need it are skipped unless HUDA_TEST_DB names a PostgreSQL server where the
/// tests may create and drop databases, such as "Host=localhost;Port=5433;Username=postgres;Password=…".
/// </summary>
public sealed class DatabaseFixture : IAsyncLifetime
{
    public const string Variable = "HUDA_TEST_DB";

    private readonly string? server = Environment.GetEnvironmentVariable(Variable);
    private readonly string database = $"huda_test_{Guid.NewGuid():N}";
    private string? connectionString;
    private WebApplicationFactory<Program>? api;

    /// <summary>A client of the API, or the test is skipped.</summary>
    public HttpClient Client => api?.CreateClient() ?? throw Skip();

    /// <summary>The API's own services, such as its DbContext, or the test is skipped.</summary>
    public IServiceProvider Services => api?.Services ?? throw Skip();

    public async ValueTask InitializeAsync()
    {
        if (server is null)
            return;
        await using (var connection = new NpgsqlConnection(server))
        {
            await connection.OpenAsync();
            await using var create = new NpgsqlCommand($"""CREATE DATABASE "{database}" """, connection);
            await create.ExecuteNonQueryAsync();
        }
        connectionString = new NpgsqlConnectionStringBuilder(server) { Database = database }.ConnectionString;
        await ImportAsync();
        api = new WebApplicationFactory<Program>().WithWebHostBuilder(host => host.UseSetting("ConnectionStrings:Huda", connectionString));
    }

    /// <summary>Migrates the database and imports the content, as the migrator does.</summary>
    /// <param name="site">The site's public folder to import from; by default the repo's.</param>
    public async Task ImportAsync(string? site = null)
    {
        await using var services = Huda.IntegrationTests.Services.Build(new()
        {
            ["ConnectionStrings:Huda"] = connectionString ?? throw Skip(),
            ["Site:Public"] = site,
        });
        await using var scope = services.CreateAsyncScope();
        await scope.ServiceProvider.MigrateDatabaseAsync();
        await scope.ServiceProvider.GetRequiredService<ContentImporter>().ImportAsync();
    }

    public async ValueTask DisposeAsync()
    {
        if (api is not null)
            await api.DisposeAsync();
        if (connectionString is not null)
        {
            NpgsqlConnection.ClearAllPools();
            await using var connection = new NpgsqlConnection(server);
            await connection.OpenAsync();
            await using var drop = new NpgsqlCommand($"""DROP DATABASE "{database}" WITH (FORCE)""", connection);
            await drop.ExecuteNonQueryAsync();
        }
    }

    private static Exception Skip() =>
        Xunit.Sdk.SkipException.ForSkip($"Set {Variable} to a PostgreSQL connection string to run the database tests.");
}

[CollectionDefinition(Name)]
public sealed class DatabaseCollection : ICollectionFixture<DatabaseFixture>
{
    public const string Name = "database";
}
