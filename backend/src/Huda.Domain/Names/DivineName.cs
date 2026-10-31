namespace Huda.Domain.Names;

/// <summary>One of the Beautiful Names, with its page at /names/{slug}: one of names.json's names.</summary>
public sealed class DivineName : IAggregateRoot
{
    public required string Slug { get; init; }

    /// <summary>Its place in the list: 1, 2, 3…</summary>
    public required int Number { get; init; }

    /// <summary>The name, fully vowelled.</summary>
    public required string Name { get; init; }

    public required string Transliteration { get; init; }

    /// <summary>A few English words, shown until its page is written.</summary>
    public required string Gloss { get; init; }

    /// <summary>Its page, once it is written.</summary>
    public NamePage? Content { get; init; }

    string IAggregateRoot.Key => Slug;
}

/// <summary>A name's page, kept very short: its meaning, the texts that establish it, its effect, and a supplication.</summary>
/// <param name="Evidence">One to three verses or hadith in which the name is established.</param>
/// <param name="Impact">What believing in the name does in a person's heart and life.</param>
/// <param name="Dua">A supplication from the Qur'an or authentic Sunnah that calls on the name.</param>
public sealed record NamePage(LocalizedText Meaning, IReadOnlyList<NameText> Evidence, LocalizedText Impact, NameText Dua);

/// <summary>A verse or hadith on a name's page, with a very short explanation.</summary>
/// <param name="Ref">«الأعراف: ١٨٠» / "Al-Aʿraf 7:180", or the hadith's collection and number.</param>
/// <param name="Explanation">One or two sentences: what it shows about the name, or when to say the supplication.</param>
/// <param name="Grading">For a hadith outside al-Bukhari and Muslim: its grading and the scholar who gave it.</param>
/// <param name="Translation">Its meaning for readers of other languages; it has no Arabic.</param>
public sealed record NameText(
    ScriptureKind Kind,
    string Text,
    LocalizedText Ref,
    LocalizedText Explanation,
    LocalizedText? Narrator = null,
    LocalizedText? Grading = null,
    LocalizedText? Translation = null);
