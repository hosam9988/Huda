using Huda.Application;
using Huda.Application.Import;
using Huda.Domain;
using Huda.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Huda.IntegrationTests;

/// <summary>The repo the tests run in, and its content.</summary>
internal static class Repo
{
    /// <summary>The site's public folder.</summary>
    public static string Public { get; } = new ConfigurationBuilder().Build().SiteFolder();

    public static string DataFile(string name) => Path.Combine(Public, "data", name);

    public static string ImageFile(string name) => Path.Combine(Public, "images", name);

    private static readonly Lazy<SiteContent> content = new(() => ReadAsync(Public).GetAwaiter().GetResult());

    /// <summary>The site's content, read from its files as the import reads them, which must keep the rules.</summary>
    public static SiteContent Content() => content.Value;

    /// <summary>The content in a site's public folder, read as the import reads it.</summary>
    public static async Task<SiteContent> ReadAsync(string site)
    {
        await using var services = Services.Build(new() { ["ConnectionStrings:Huda"] = "Host=unused", ["Site:Public"] = site });
        var read = await services.GetRequiredService<IContentSource>().ReadAsync(CancellationToken.None);
        return read.Problems().ToList() is [] ? read : throw new InvalidOperationException(string.Join('\n', read.Problems()));
    }
}

/// <summary>The application and its infrastructure, wired as the hosts wire them, with the given settings.</summary>
internal static class Services
{
    public static ServiceProvider Build(Dictionary<string, string?> settings)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddLogging();
        services.AddApplication().AddInfrastructure();
        return services.BuildServiceProvider();
    }
}
