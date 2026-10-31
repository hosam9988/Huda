using System.Globalization;

namespace Huda.Domain.Names;

/// <summary>
/// A search of the names, as the site does it (matchesName in search.ts): the name in Arabic, without tashkeel or
/// «ال» («رحمن» finds «الرَّحْمَٰنُ»); or else, if any Latin text is left of the search, the transliteration
/// ("ar rahman"), the meanings, or the number.
/// </summary>
public sealed class NameSearch
{
    private readonly string arabic, name, latin, compact;

    private NameSearch(string query)
    {
        arabic = TextNormalizer.NormalizeArabic(query);
        name = arabic.StartsWith("ال", StringComparison.Ordinal) ? arabic[2..] : arabic;
        latin = TextNormalizer.NormalizeLatin(query);
        compact = latin.Replace(" ", "", StringComparison.Ordinal);
    }

    /// <summary>The search for what a reader typed; null when it is blank, and so finds every name.</summary>
    public static NameSearch? Parse(string? query) =>
        TextNormalizer.Trim(query) is { Length: > 0 } trimmed ? new(trimmed) : null;

    public bool Matches(DivineName divineName)
    {
        if (name.Length > 0 && TextNormalizer.NormalizeArabic(divineName.Name).Contains(name, StringComparison.Ordinal))
            return true;
        if (compact.Length == 0)
            return false;
        var meanings = string.Join(' ', divineName.Content?.Meaning.Texts().Prepend(divineName.Gloss) ?? [divineName.Gloss]);
        return TextNormalizer.NormalizeLatin(divineName.Transliteration).Replace(" ", "", StringComparison.Ordinal).Contains(compact, StringComparison.Ordinal)
            || TextNormalizer.NormalizeLatin(meanings).Contains(latin, StringComparison.Ordinal)
            || TextNormalizer.NormalizeArabic(meanings).Contains(arabic, StringComparison.Ordinal)
            || divineName.Number.ToString(CultureInfo.InvariantCulture) == compact;
    }
}
