using System.ComponentModel.DataAnnotations;
using Huda.Domain;
using Huda.Domain.Signs;

namespace Huda.Application.Signs;

/// <summary>Reading the signs and the fields of knowledge they are grouped under.</summary>
public sealed class SignCatalog(IRepository<Category> categories, IRepository<Sign> signs)
{
    /// <summary>The fields, in the site's order, with how many signs of each kind they have.</summary>
    public async Task<IReadOnlyList<CategoryCard>> CategoriesAsync(CancellationToken cancellationToken)
    {
        var all = await signs.ListAsync(cancellationToken);
        return
        [
            .. (await categories.ListAsync(cancellationToken)).Select(c => new CategoryCard(
                c.Id,
                c.Title,
                c.Blurb,
                c.Art,
                all.Count(s => s.Category == c.Id && s.Kind() == SignKind.Miracle),
                all.Count(s => s.Category == c.Id && s.Kind() == SignKind.Reflection))),
        ];
    }

    public async Task<bool> CategoryExistsAsync(string id, CancellationToken cancellationToken) =>
        await categories.GetAsync(id, cancellationToken) is not null;

    /// <summary>The cards of the signs that pass the filter, in reading order, or in the journey's order for the journey.</summary>
    public async Task<IReadOnlyList<SignCard>> ListAsync(SignFilter filter, CancellationToken cancellationToken)
    {
        var search = SignSearch.Parse(filter.Q);
        var found = (await signs.ListAsync(cancellationToken)).Where(s =>
            (filter.Category is null || s.Category == filter.Category)
            && (filter.Kind is null || s.Kind() == filter.Kind)
            && (search is null || search.Matches(s)));
        var ordered = filter.Journey
            ? ReadingOrder.Journey(found)
            : ReadingOrder.Sort(found, await categories.ListAsync(cancellationToken));
        return [.. ordered.Select(SignCard.Of)];
    }

    public Task<Sign?> GetAsync(string slug, CancellationToken cancellationToken) => signs.GetAsync(slug, cancellationToken);

    /// <summary>ayat.json itself: the fields, then every sign, in the content's order.</summary>
    public async Task<SignsContent> ContentAsync(CancellationToken cancellationToken) =>
        new(await categories.ListAsync(cancellationToken), await signs.ListAsync(cancellationToken));
}

/// <summary>Which signs a list shows; with no filter, all of them.</summary>
public sealed record SignFilter
{
    /// <summary>Only this field's signs, such as "cosmos".</summary>
    public string? Category { get; init; }

    /// <summary>Only the miracles, or only the signs for reflection.</summary>
    public SignKind? Kind { get; init; }

    /// <summary>Only the signs on the journey for readers new to Islam, in the journey's order.</summary>
    public bool Journey { get; init; }

    /// <summary>
    /// Words that must all appear in a sign's title, summary, hook, or verses and their references, as in the
    /// site's search: Arabic without tashkeel or letter variants («السماء» finds «ٱلسَّمَآءِ»), other text
    /// without case or apostrophes. Up to 500 characters, enough for a pasted verse.
    /// </summary>
    // Kept as sent: model binding would make it null if it were .NET whitespace, which isn't JavaScript's.
    [StringLength(500)]
    [DisplayFormat(ConvertEmptyStringToNull = false)]
    public string? Q { get; init; }
}

/// <summary>A sign's card: what a list of signs shows. What is absent is left out, so it comes last.</summary>
/// <param name="Lead">Its first verse or hadith, which leads a sign for reflection's card.</param>
public sealed record SignCard(
    string Slug,
    string Category,
    LocalizedText Title,
    LocalizedText Summary,
    LocalizedText Hook,
    Scripture Lead,
    string Art,
    string? Type = null,
    int? Journey = null)
{
    public static SignCard Of(Sign s) => new(s.Slug, s.Category, s.Title, s.Summary, s.Hook, s.Evidence[0], s.Art, s.Type, s.Journey);
}

/// <summary>A field of knowledge, with how many miracles and signs for reflection it has.</summary>
public sealed record CategoryCard(string Id, LocalizedText Title, LocalizedText Blurb, string Art, int Miracles, int Reflections);

/// <summary>ayat.json: the fields of knowledge and the signs.</summary>
public sealed record SignsContent(IReadOnlyList<Category> Categories, IReadOnlyList<Sign> Ayat);
