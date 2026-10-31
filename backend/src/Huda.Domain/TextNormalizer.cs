using System.Text;
using System.Text.RegularExpressions;

namespace Huda.Domain;

/// <summary>
/// How the site's search box compares text (src/app/core/utils/search.ts): Arabic without tashkeel and with
/// letter variants unified, other text without case, apostrophes or hyphens, and words split and trimmed as
/// JavaScript does it.
/// </summary>
public static partial class TextNormalizer
{
    /// <summary>
    /// What JavaScript's \s and trim() take for whitespace. It isn't .NET's: JavaScript counts U+FEFF and not
    /// U+0085, and the site's search splits and trims with JavaScript's.
    /// </summary>
    public static readonly char[] Whitespaces =
    [
        '\t', '\n', '\v', '\f', '\r', ' ', '\u00A0', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004',
        '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F', '\u205F',
        '\u3000', '\uFEFF',
    ];

    /// <summary>Strips tashkeel and unifies letter variants, so «السماء» matches «ٱلسَّمَآءِ».</summary>
    public static string NormalizeArabic(string text)
    {
        var stripped = ArabicMarks().Replace(text, "");
        var result = new StringBuilder(stripped.Length);
        foreach (var c in stripped)
        {
            result.Append(c switch
            {
                'أ' or 'إ' or 'آ' or 'ٱ' => 'ا',
                'ى' => 'ي',
                'ة' => 'ه',
                'ؤ' => 'و',
                'ئ' => 'ي',
                _ => c,
            });
        }
        return result.ToString();
    }

    /// <summary>Lower case, without apostrophes or hyphens, and with runs of spaces made one.</summary>
    public static string NormalizeLatin(string text) =>
        Whitespace().Replace(LatinMarks().Replace(text.ToLowerInvariant(), ""), " ");

    /// <summary>A search without the whitespace around it, as the site trims it.</summary>
    public static string Trim(string? query) => query?.Trim(Whitespaces) ?? "";

    /// <summary>The words of a search, as the site splits them.</summary>
    public static string[] Words(string? query) =>
        Trim(query) is { Length: > 0 } trimmed ? Whitespace().Split(trimmed) : [];

    // The site's marks (U+0610–061A, 064B–065F, 0670, 06D6–06ED and the tatweel), plus the Arabic Extended-A
    // marks (U+08D3–08FF), which include the Qur'an's open tanween.
    [GeneratedRegex("[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08D3-\u08FF]")]
    private static partial Regex ArabicMarks();

    [GeneratedRegex("[’'`-]")]
    private static partial Regex LatinMarks();

    // Whitespaces, as a character class.
    [GeneratedRegex("[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+")]
    private static partial Regex Whitespace();
}
