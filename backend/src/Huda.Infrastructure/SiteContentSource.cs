using System.Text.Json;
using Huda.Application.Import;
using Huda.Application.Names;
using Huda.Application.Signs;
using Huda.Domain;

namespace Huda.Infrastructure;

/// <summary>Reads the content from the site's own data files, data/ayat.json and data/names.json.</summary>
/// <param name="folder">The site's public folder.</param>
internal sealed class SiteContentSource(string folder) : IContentSource
{
    public async Task<SiteContent> ReadAsync(CancellationToken cancellationToken)
    {
        var signs = await ReadAsync<SignsContent>("ayat.json", cancellationToken);
        var names = await ReadAsync<NamesContent>("names.json", cancellationToken);
        return new SiteContent(signs.Categories, signs.Ayat, names.Names);
    }

    private async Task<T> ReadAsync<T>(string file, CancellationToken cancellationToken)
    {
        try
        {
            await using var stream = File.OpenRead(Path.Combine(folder, "data", file));
            return await JsonSerializer.DeserializeAsync<T>(stream, ContentJson.Strict, cancellationToken)
                ?? throw new JsonException("The file holds null.");
        }
        catch (Exception e) when (e is JsonException or IOException)
        {
            // Some of the serializer's messages, such as for a field it doesn't know, leave out where it is.
            var where = e is JsonException { Path: { } at } && !e.Message.Contains(at, StringComparison.Ordinal) ? $" Path: {at}" : "";
            throw new InvalidDataException($"{file}: {e.Message}{where}", e);
        }
    }
}
