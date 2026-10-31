using System.Text.Json.Nodes;

namespace Huda.IntegrationTests;

/// <summary>The site's data files, read strictly, as the import reads them.</summary>
public sealed class SiteFilesTests
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Reads_every_entry_of_the_site_content()
    {
        var content = Repo.Content();
        var signs = JsonNode.Parse(await File.ReadAllTextAsync(Repo.DataFile("ayat.json"), Cancel))!;
        var names = JsonNode.Parse(await File.ReadAllTextAsync(Repo.DataFile("names.json"), Cancel))!;

        Assert.Equal(signs["categories"]!.AsArray().Count, content.Categories.Count);
        Assert.Equal(signs["ayat"]!.AsArray().Count, content.Signs.Count);
        Assert.Equal(names["names"]!.AsArray().Count, content.Names.Count);
    }

    [Fact]
    public async Task Refuses_a_file_that_is_not_the_contents_json_and_says_where()
    {
        // A field the content doesn't have, or a language; a field missing, or null where it needs a value; a value
        // of the wrong kind; a missing file.
        await RefusesAsync("ayat.json", ayat => ayat["ayat"]![0]!["color"] = "red", "'color'", "Path: $.ayat[0].color");
        await RefusesAsync("ayat.json", ayat => ayat["ayat"]![0]!["kind"] = "reflection", "'kind'", "Path: $.ayat[0].kind");
        await RefusesAsync("ayat.json", ayat => ayat["ayat"]![0]!["title"]!["fr"] = "Le ciel", "'fr'", "Path: $.ayat[0].title.fr");
        await RefusesAsync("ayat.json", ayat => ayat["ayat"]![0]!.AsObject().Remove("title"), "'title'", "Path: $.ayat[0]");
        await RefusesAsync("ayat.json", ayat => ayat["ayat"]![0]!["art"] = null, "'art'", "Path: $.ayat[0].art");
        await RefusesAsync("ayat.json", ayat => ayat["ayat"]![0]!["evidence"]![0]!["kind"] = "poem", "Path: $.ayat[0].evidence[0].kind");
        await RefusesAsync("ayat.json", ayat => ayat["ayat"]![0]!["timeline"]![0]!["year"] = 1929, "Path: $.ayat[0].timeline[0].year");
        await RefusesAsync(
            "ayat.json", ayat => ayat["ayat"]![0]!["timeline"]![0]!["year"] = new JsonObject { ["fr"] = "1929" },
            "'fr'", "Path: $.ayat[0].timeline[0].year");
        await RefusesAsync("names.json", names => names["names"]![0]!["content"]!.AsObject().Remove("dua"), "'dua'", "Path: $.names[0].content");
        await RefusesAsync("names.json", names => names["names"] = null, "'Names'");
        await RefusesAsync("names.json", change: null, "Could not find file");
    }

    // Reads the site's data with one file changed, or left out, and checks the error names that file first and
    // then says all of these.
    private static async Task RefusesAsync(string file, Action<JsonNode>? change, params string[] says)
    {
        var site = Path.Combine(Path.GetTempPath(), "huda-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(site, "data"));
        try
        {
            foreach (var name in new[] { "ayat.json", "names.json" })
            {
                var json = JsonNode.Parse(await File.ReadAllTextAsync(Repo.DataFile(name), Cancel))!;
                if (name == file && change is null)
                    continue;
                if (name == file)
                    change!(json);
                await File.WriteAllTextAsync(Path.Combine(site, "data", name), json.ToJsonString(), Cancel);
            }
            var error = await Assert.ThrowsAsync<InvalidDataException>(() => Repo.ReadAsync(site));
            Assert.StartsWith($"{file}: ", error.Message);
            Assert.All(says, part => Assert.Contains(part, error.Message));
        }
        finally
        {
            Directory.Delete(site, recursive: true);
        }
    }
}
