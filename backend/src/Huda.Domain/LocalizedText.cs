namespace Huda.Domain;

/// <summary>
/// Text in the site's languages, as the data files write it: { "ar": "…", "en": "…" }. Arabic is nearly always
/// there; a verse's translation has only English. A language the site adds gets a property here too.
/// </summary>
public sealed record LocalizedText(string? Ar = null, string? En = null)
{
    /// <summary>The texts there are, Arabic first.</summary>
    public IEnumerable<string> Texts() => new[] { Ar, En }.OfType<string>();
}

/// <summary>Where a text comes from: the Qur'an, or a hadith.</summary>
public enum ScriptureKind
{
    Quran,
    Hadith,
}
