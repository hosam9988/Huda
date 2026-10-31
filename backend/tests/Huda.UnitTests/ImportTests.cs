using Huda.Application.Import;
using Huda.Domain;
using Huda.Domain.Names;
using Huda.Domain.Signs;
using Microsoft.Extensions.Logging.Abstractions;

namespace Huda.UnitTests;

public sealed class ImportTests
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    private readonly InMemoryRepository<Category> categories = new(Make.Category("old"));
    private readonly InMemoryRepository<Sign> signs = new(Make.Sign("old", "old"));
    private readonly InMemoryRepository<DivineName> names = new(Make.Name("old"));

    private Task ImportAsync(SiteContent content) =>
        new ContentImporter(new FakeSource(content), categories, signs, names, NullLogger<ContentImporter>.Instance).ImportAsync(Cancel);

    [Fact]
    public async Task Replaces_the_content_with_the_sources()
    {
        var content = new SiteContent([Make.Category()], [Make.Sign()], [Make.Name()]);

        await ImportAsync(content);

        Assert.Same(content.Categories, categories.Entities);
        Assert.Same(content.Signs, signs.Entities);
        Assert.Same(content.Names, names.Entities);
    }

    [Fact]
    public async Task Imports_nothing_from_content_with_problems()
    {
        var error = await Assert.ThrowsAsync<InvalidDataException>(() =>
            ImportAsync(new SiteContent([Make.Category()], [Make.Sign(category: "nowhere")], [Make.Name()])));

        Assert.Equal(
            "The content has 1 problem(s):\nSign 'expanding-universe' is in field 'nowhere', which isn't listed.",
            error.Message);
        Assert.Equal(["old"], categories.Entities.Select(c => c.Id));
        Assert.Equal(["old"], signs.Entities.Select(s => s.Slug));
        Assert.Equal(["old"], names.Entities.Select(n => n.Slug));
    }
}
