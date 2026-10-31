using System.Text.RegularExpressions;
using Huda.Domain.Names;
using Huda.Domain.Signs;

namespace Huda.Domain;

/// <summary>
/// The whole of the site's content, as an import brings it in: the fields of knowledge and the signs of
/// ayat.json, and the names of names.json, each list in its file's order.
/// </summary>
public sealed partial record SiteContent(
    IReadOnlyList<Category> Categories, IReadOnlyList<Sign> Signs, IReadOnlyList<DivineName> Names)
{
    /// <summary>
    /// What breaks the rules the API relies on: every key fits in a URL and is used once; every sign is in a
    /// field that is listed and has a verse or hadith; no two signs share a journey stop, the stops count from 1,
    /// and a sign's type is "reflection" or absent; and no two names share a number. The site's
    /// <c>npm run check:content</c> checks the rest.
    /// </summary>
    public IEnumerable<string> Problems()
    {
        string[] keys = [.. Categories.Select(c => c.Id), .. Signs.Select(s => s.Slug), .. Names.Select(n => n.Slug)];
        foreach (var key in keys.Where(key => !Slug().IsMatch(key)))
            yield return $"'{key}' must be lower-case letters and digits, in words joined by hyphens.";
        foreach (var id in Repeated(Categories.Select(c => c.Id)))
            yield return $"Field '{id}' is listed twice.";
        foreach (var slug in Repeated(Signs.Select(s => s.Slug)))
            yield return $"Sign '{slug}' is listed twice.";
        foreach (var stop in Repeated(Signs.Select(s => s.Journey).OfType<int>()))
            yield return $"Journey stop {stop} is taken by two signs.";
        foreach (var slug in Repeated(Names.Select(n => n.Slug)))
            yield return $"Name '{slug}' is listed twice.";
        foreach (var number in Repeated(Names.Select(n => n.Number)))
            yield return $"Number {number} is taken by two names.";

        foreach (var sign in Signs)
        {
            if (!Categories.Any(c => c.Id == sign.Category))
                yield return $"Sign '{sign.Slug}' is in field '{sign.Category}', which isn't listed.";
            if (sign.Evidence.Count == 0)
                yield return $"Sign '{sign.Slug}' has no verse or hadith.";
            if (sign.Journey < 1)
                yield return $"Sign '{sign.Slug}' has journey stop {sign.Journey}; the stops count from 1.";
            if (sign.Type is not (null or "reflection"))
                yield return $"Sign '{sign.Slug}' has type '{sign.Type}'; it must be 'reflection' or absent.";
        }
    }

    private static IEnumerable<T> Repeated<T>(IEnumerable<T> values) =>
        values.GroupBy(value => value).Where(group => group.Count() > 1).Select(group => group.Key);

    // \z, not $: in .NET, $ also matches before a final newline, which would let "cosmos\n" through.
    [GeneratedRegex(@"^[a-z0-9]+(-[a-z0-9]+)*\z")]
    private static partial Regex Slug();
}
