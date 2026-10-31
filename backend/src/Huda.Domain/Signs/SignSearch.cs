namespace Huda.Domain.Signs;

/// <summary>
/// A search of the signs, as the site's search box does it (matchesQuery in search.ts): every word must appear
/// in a sign's title, summary, hook, or verses and their references, compared as Arabic or, when the word has
/// Latin text left, as Latin text.
/// </summary>
public sealed class SignSearch
{
    private readonly (string Arabic, string Latin)[] words;

    private SignSearch(string[] words) =>
        this.words = [.. words.Select(word => (TextNormalizer.NormalizeArabic(word), TextNormalizer.NormalizeLatin(word)))];

    /// <summary>The search for what a reader typed; null when it has no words, and so finds every sign.</summary>
    public static SignSearch? Parse(string? query) =>
        TextNormalizer.Words(query) is { Length: > 0 } words ? new(words) : null;

    public bool Matches(Sign sign)
    {
        var text = string.Join(' ', [
            .. sign.Title.Texts(),
            .. sign.Summary.Texts(),
            .. sign.Hook.Texts(),
            .. sign.Evidence.SelectMany(e => e.Ref.Texts().Prepend(e.Text)),
        ]);
        var arabic = TextNormalizer.NormalizeArabic(text);
        var latin = TextNormalizer.NormalizeLatin(text);
        return words.All(word =>
            arabic.Contains(word.Arabic, StringComparison.Ordinal)
            || (word.Latin.Length > 0 && latin.Contains(word.Latin, StringComparison.Ordinal)));
    }
}
