using System.ComponentModel.DataAnnotations;
using Huda.Domain;
using Huda.Domain.Names;

namespace Huda.Application.Names;

/// <summary>Reading the Beautiful Names.</summary>
public sealed class NameCatalog(IRepository<DivineName> names)
{
    /// <summary>The cards of the names the search finds, or of all of them without one, in order.</summary>
    public async Task<IReadOnlyList<NameCard>> ListAsync(NameFilter filter, CancellationToken cancellationToken)
    {
        var search = NameSearch.Parse(filter.Q);
        return
        [
            .. (await names.ListAsync(cancellationToken))
                .Where(n => search is null || search.Matches(n))
                .OrderBy(n => n.Number)
                .Select(NameCard.Of),
        ];
    }

    public Task<DivineName?> GetAsync(string slug, CancellationToken cancellationToken) => names.GetAsync(slug, cancellationToken);

    /// <summary>names.json itself.</summary>
    public async Task<NamesContent> ContentAsync(CancellationToken cancellationToken) => new(await names.ListAsync(cancellationToken));
}

/// <summary>Which names a list shows; without a search, all of them.</summary>
public sealed record NameFilter
{
    /// <summary>
    /// A search, as on the site: the name in Arabic with or without tashkeel and «ال» («رحمن» finds
    /// «الرَّحْمَٰنُ»), its transliteration ("ar rahman"), its meaning, or its number. Up to 500 characters.
    /// </summary>
    // Kept as sent: model binding would make it null if it were .NET whitespace, which isn't JavaScript's.
    [StringLength(500)]
    [DisplayFormat(ConvertEmptyStringToNull = false)]
    public string? Q { get; init; }
}

/// <summary>A name's card: what a list of names shows.</summary>
/// <param name="Meaning">The meaning on its page, once the page is written.</param>
public sealed record NameCard(string Slug, int Number, string Name, string Transliteration, string Gloss, LocalizedText? Meaning = null)
{
    public static NameCard Of(DivineName n) => new(n.Slug, n.Number, n.Name, n.Transliteration, n.Gloss, n.Content?.Meaning);
}

/// <summary>names.json: the Beautiful Names.</summary>
public sealed record NamesContent(IReadOnlyList<DivineName> Names);
