using System.Net;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;

namespace Huda.IntegrationTests;

[Collection(DatabaseCollection.Name)]
public sealed class ImportTests(DatabaseFixture db)
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Replaces_what_was_imported_before_or_keeps_it_whole()
    {
        using var client = db.Client; // the test is skipped here without a database, before it writes anything

        // A copy of the site's data whose ayat.json has lost its last sign.
        var site = Path.Combine(Path.GetTempPath(), "huda-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(site, "data"));
        var file = JsonNode.Parse(await File.ReadAllTextAsync(Repo.DataFile("ayat.json"), Cancel))!;
        var signs = file["ayat"]!.AsArray();
        var (first, last) = ((string)signs[0]!["slug"]!, (string)signs[^1]!["slug"]!);
        signs.RemoveAt(signs.Count - 1);
        await File.WriteAllTextAsync(Path.Combine(site, "data", "ayat.json"), file.ToJsonString(), Cancel);
        File.Copy(Repo.DataFile("names.json"), Path.Combine(site, "data", "names.json"));
        try
        {
            // An import replaces the rows, so the sign the data no longer has is gone.
            await db.ImportAsync(site);
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/signs/{last}", Cancel)).StatusCode);

            // Rows the database refuses (it can't store a NUL) leave their table as it was, whole.
            signs[0]!["title"]!["en"] = "\0";
            await File.WriteAllTextAsync(Path.Combine(site, "data", "ayat.json"), file.ToJsonString(), Cancel);
            await Assert.ThrowsAnyAsync<DbUpdateException>(() => db.ImportAsync(site));
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/signs/{first}", Cancel)).StatusCode);
            Assert.Equal(signs.Count, JsonNode.Parse(await client.GetStringAsync("/api/signs", Cancel))!.AsArray().Count);
        }
        finally
        {
            Directory.Delete(site, recursive: true);
            await db.ImportAsync();
        }
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/signs/{last}", Cancel)).StatusCode);
    }
}
