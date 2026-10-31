using System.Net;
using System.Text.Json.Nodes;
using Huda.Domain.Signs;
using Huda.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Huda.IntegrationTests;

[Collection(DatabaseCollection.Name)]
public sealed class ApiTests(DatabaseFixture db)
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    private async Task<JsonNode> GetJsonAsync(string path, HttpStatusCode status = HttpStatusCode.OK)
    {
        using var response = await db.Client.GetAsync(path, Cancel);
        Assert.Equal(status, response.StatusCode);
        return JsonNode.Parse(await response.Content.ReadAsStringAsync(Cancel))!;
    }

    private async Task<string[]> SlugsAsync(string path) =>
        [.. (await GetJsonAsync(path)).AsArray().Select(item => (string)item!["slug"]!)];

    [Fact]
    public async Task Lists_the_fields_in_order_with_their_counts()
    {
        var content = Repo.Content();
        var fields = (await GetJsonAsync("/api/categories")).AsArray();

        Assert.Equal(content.Categories.Select(c => c.Id), fields.Select(f => (string)f!["id"]!));
        Assert.All(fields, field =>
        {
            var id = (string)field!["id"]!;
            Assert.Equal(content.Signs.Count(s => s.Category == id && s.Kind() == SignKind.Miracle), (int)field["miracles"]!);
            Assert.Equal(content.Signs.Count(s => s.Category == id && s.Kind() == SignKind.Reflection), (int)field["reflections"]!);
        });
    }

    [Fact]
    public async Task Lists_the_signs_in_the_sites_reading_order()
    {
        var content = Repo.Content();
        var byField = content.Categories.SelectMany(c => content.Signs.Where(s => s.Category == c.Id)).ToList();
        string[] reading =
            [.. byField.Where(s => s.Kind() == SignKind.Miracle).Concat(byField.Where(s => s.Kind() == SignKind.Reflection)).Select(s => s.Slug)];

        Assert.Equal(reading, await SlugsAsync("/api/signs"));
    }

    [Fact]
    public async Task Filters_by_kind_field_and_journey()
    {
        var content = Repo.Content();

        Assert.Equal(content.Signs.Count(s => s.Kind() == SignKind.Reflection), (await SlugsAsync("/api/signs?kind=reflection")).Length);
        Assert.Equal(content.Signs.Count(s => s.Kind() == SignKind.Miracle), (await SlugsAsync("/api/signs?kind=miracle")).Length);
        Assert.Equal(
            content.Signs.Where(s => s.Category == "cosmos" && s.Kind() == SignKind.Reflection).Select(s => s.Slug).Order(),
            (await SlugsAsync("/api/signs?category=cosmos&kind=reflection")).Order());
        Assert.Equal(
            content.Signs.Where(s => s.Journey is not null).OrderBy(s => s.Journey).Select(s => s.Slug),
            await SlugsAsync("/api/signs?journey=true"));
    }

    [Fact]
    public async Task Searches_as_the_site_does()
    {
        // Without tashkeel or letter variants, every word must appear, and in Latin text without case.
        var plain = await SlugsAsync("/api/signs?q=" + Uri.EscapeDataString("السماء"));
        Assert.Contains("expanding-universe", plain);
        Assert.Equal(plain, await SlugsAsync("/api/signs?q=" + Uri.EscapeDataString("ٱلسَّمَآءِ")));
        Assert.Contains("expanding-universe", await SlugsAsync("/api/signs?q=" + Uri.EscapeDataString("بأييد لموسعون")));
        Assert.Contains("expanding-universe", await SlugsAsync("/api/signs?q=adh-dhariyat%2051:47"));
        Assert.Empty(await SlugsAsync("/api/signs?q=%25%25%25"));

        // A verse pasted whole finds its sign.
        var longest = Repo.Content().Signs.SelectMany(s => s.Evidence.Select(e => (s.Slug, e.Text))).MaxBy(e => e.Text.Length);
        Assert.Contains(longest.Slug, await SlugsAsync("/api/signs?q=" + Uri.EscapeDataString(longest.Text)));

        Assert.Contains("ar-rahman", await SlugsAsync("/api/names?q=" + Uri.EscapeDataString("رحمن")));
        Assert.Contains("ar-rahman", await SlugsAsync("/api/names?q=ar%20rahman"));
        Assert.Equal("allah", (await SlugsAsync("/api/names?q=1"))[0]);
    }

    [Fact]
    public async Task Handles_odd_queries_as_the_site_does()
    {
        // U+0085 is whitespace to .NET but a character to JavaScript, so the site finds nothing for it.
        Assert.Empty(await SlugsAsync("/api/signs?q=%C2%85"));
        Assert.Empty(await SlugsAsync("/api/names?q=%C2%85"));
        Assert.Equal(Repo.Content().Signs.Count, (await SlugsAsync("/api/signs?q=%20%20")).Length);

        // A key named after the filter's parameter doesn't switch the filters off.
        Assert.Equal(await SlugsAsync("/api/signs?kind=reflection"), await SlugsAsync("/api/signs?filter=x&kind=reflection"));
        Assert.Equal(
            await SlugsAsync("/api/names?q=" + Uri.EscapeDataString("رحمن")),
            await SlugsAsync("/api/names?filter=x&q=" + Uri.EscapeDataString("رحمن")));
    }

    [Fact]
    public async Task Returns_a_page_or_a_problem()
    {
        var sign = await GetJsonAsync("/api/signs/expanding-universe");
        Assert.Equal("expanding-universe", (string)sign["slug"]!);
        Assert.Equal(1, (int)(await GetJsonAsync("/api/names/allah"))["number"]!);

        var missing = await GetJsonAsync("/api/signs/no-such-sign", HttpStatusCode.NotFound);
        Assert.Equal(404, (int)missing["status"]!);
        await GetJsonAsync("/api/names/no-such-name", HttpStatusCode.NotFound);

        Assert.NotNull((await GetJsonAsync("/api/signs?category=nowhere", HttpStatusCode.BadRequest))["errors"]);
        await GetJsonAsync("/api/signs?category=%00", HttpStatusCode.BadRequest);
        await GetJsonAsync("/api/signs?kind=other", HttpStatusCode.BadRequest);
        await GetJsonAsync("/api/signs?q=" + new string('a', 501), HttpStatusCode.BadRequest);
        await GetJsonAsync("/api/names?q=" + new string('a', 501), HttpStatusCode.BadRequest);
        await GetJsonAsync("/api/signs?q=" + new string('a', 500));
        await GetJsonAsync("/api/names?q=" + new string('a', 500));

        // Errors are Problem Details, by their media type too.
        using var response = await db.Client.GetAsync("/api/signs/no-such-sign", Cancel);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Serves_the_data_files_as_they_are()
    {
        foreach (var (path, file) in new[] { ("/api/content/signs", "ayat.json"), ("/api/content/names", "names.json") })
        {
            var expected = JsonNode.Parse(await File.ReadAllTextAsync(Repo.DataFile(file), Cancel));
            Assert.True(JsonNode.DeepEquals(expected, await GetJsonAsync(path)), $"{path} differs from {file}.");
        }
    }

    [Fact]
    public async Task Serves_rows_with_a_field_this_build_does_not_know()
    {
        // A newer import may write one while the API of the build before it still runs.
        await using var scope = db.Services.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<HudaDbContext>().Database;
        await database.ExecuteSqlRawAsync(
            "UPDATE signs SET document = document || jsonb_build_object('color', 'red') WHERE key = 'expanding-universe'", Cancel);
        try
        {
            Assert.Contains("expanding-universe", await SlugsAsync("/api/signs"));
            Assert.Equal("expanding-universe", (string)(await GetJsonAsync("/api/signs/expanding-universe"))["slug"]!);
            await GetJsonAsync("/api/content/signs");
        }
        finally
        {
            await database.ExecuteSqlRawAsync("UPDATE signs SET document = document - 'color' WHERE key = 'expanding-universe'", Cancel);
        }
    }

    [Fact]
    public async Task Serves_the_sites_images_by_their_names()
    {
        var art = Repo.Content().Signs.Single(s => s.Slug == "expanding-universe").Art;
        foreach (var file in new[] { $"{art}.webp", $"{art}-sm.webp" })
        {
            using var response = await db.Client.GetAsync($"/img/{file}", Cancel);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("image/webp", response.Content.Headers.ContentType?.MediaType);
            Assert.Equal(TimeSpan.FromSeconds(300), response.Headers.CacheControl?.MaxAge);
            Assert.Equal(await File.ReadAllBytesAsync(Repo.ImageFile(file), Cancel), await response.Content.ReadAsByteArrayAsync(Cancel));
        }
        await GetJsonAsync("/img/no-such-image.webp", HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Lets_only_the_site_read_the_content_from_a_browser()
    {
        foreach (var (origin, allowed) in new[] { ("https://hosam9988.github.io", true), ("https://example.com", false) })
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/signs") { Headers = { { "Origin", origin } } };
            using var response = await db.Client.SendAsync(request, Cancel);
            Assert.Equal(allowed, response.Headers.Contains("Access-Control-Allow-Origin"));
        }
        Assert.Equal("Healthy", await db.Client.GetStringAsync("/health", Cancel));
    }

    [Fact]
    public async Task Lets_the_content_be_kept_for_five_minutes()
    {
        // By Origin, since only the site's own requests get the CORS header.
        foreach (var path in new[] { "/api/signs", "/api/names" })
        {
            using var response = await db.Client.GetAsync(path, Cancel);
            Assert.Equal(TimeSpan.FromSeconds(300), response.Headers.CacheControl?.MaxAge);
            Assert.True(response.Headers.CacheControl?.Public);
            Assert.Contains("Origin", response.Headers.Vary);
        }
    }
}
