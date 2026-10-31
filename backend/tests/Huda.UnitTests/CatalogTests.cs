using Huda.Application.Names;
using Huda.Application.Signs;
using Huda.Domain.Names;
using Huda.Domain.Signs;

namespace Huda.UnitTests;

public sealed class CatalogTests
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    private readonly SignCatalog signs = new(
        new InMemoryRepository<Category>(Make.Category("cosmos"), Make.Category("earth")),
        new InMemoryRepository<Sign>(
            Make.Sign("earth-reflection", "earth", "reflection", journey: 2),
            Make.Sign("earth-miracle", "earth", title: "الجبال", englishTitle: "Mountains"),
            Make.Sign("cosmos-miracle", "cosmos", journey: 1)));

    private async Task<string[]> SlugsAsync(SignFilter filter) =>
        [.. (await signs.ListAsync(filter, Cancel)).Select(card => card.Slug)];

    [Fact]
    public async Task Counts_each_fields_miracles_and_signs_for_reflection()
    {
        var fields = await signs.CategoriesAsync(Cancel);

        Assert.Equal([("cosmos", 1, 0), ("earth", 1, 1)], fields.Select(f => (f.Id, f.Miracles, f.Reflections)));
    }

    [Fact]
    public async Task Lists_the_signs_in_reading_order_or_as_filtered()
    {
        Assert.Equal(["cosmos-miracle", "earth-miracle", "earth-reflection"], await SlugsAsync(new()));
        Assert.Equal(["earth-miracle", "earth-reflection"], await SlugsAsync(new() { Category = "earth" }));
        Assert.Equal(["earth-reflection"], await SlugsAsync(new() { Kind = SignKind.Reflection }));
        Assert.Equal(["cosmos-miracle", "earth-reflection"], await SlugsAsync(new() { Journey = true }));
        Assert.Equal(["earth-miracle"], await SlugsAsync(new() { Q = "mountains" }));
        Assert.Empty(await SlugsAsync(new() { Category = "cosmos", Q = "mountains" }));
    }

    [Fact]
    public async Task Finds_a_sign_and_whether_a_field_is_there()
    {
        var card = (await signs.ListAsync(new() { Q = "mountains" }, Cancel)).Single();
        var sign = await signs.GetAsync("earth-miracle", Cancel);

        Assert.Equal(sign!.Evidence[0], card.Lead);
        Assert.Null(await signs.GetAsync("no-such-sign", Cancel));
        Assert.True(await signs.CategoryExistsAsync("cosmos", Cancel));
        Assert.False(await signs.CategoryExistsAsync("nowhere", Cancel));
    }

    [Fact]
    public async Task Gives_the_whole_content_in_its_own_order()
    {
        var content = await signs.ContentAsync(Cancel);

        Assert.Equal(["cosmos", "earth"], content.Categories.Select(c => c.Id));
        Assert.Equal(["earth-reflection", "earth-miracle", "cosmos-miracle"], content.Ayat.Select(s => s.Slug));
    }

    [Fact]
    public async Task Lists_the_names_by_number_or_as_searched()
    {
        var names = new NameCatalog(new InMemoryRepository<DivineName>(
            Make.Name("ar-rahman", 2, "الرَّحْمَٰنُ", "Ar-Rahman", "The Most Merciful", "ذو الرحمة"),
            Make.Name("allah", 1)));

        Assert.Equal(["allah", "ar-rahman"], (await names.ListAsync(new(), Cancel)).Select(card => card.Slug));
        Assert.Equal(["ar-rahman"], (await names.ListAsync(new() { Q = "رحمن" }, Cancel)).Select(card => card.Slug));
        Assert.Equal(["ar-rahman", "allah"], (await names.ContentAsync(Cancel)).Names.Select(n => n.Slug));
        Assert.Equal(1, (await names.GetAsync("allah", Cancel))?.Number);
    }
}
