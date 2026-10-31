using System.Text.Json;
using System.Text.Json.Serialization;

namespace Huda.Domain.Signs;

/// <summary>One sign, with its page at /signs/{slug}: one of ayat.json's ayat.</summary>
public sealed class Sign : IAggregateRoot
{
    public required string Slug { get; init; }

    /// <summary>The id of its field.</summary>
    public required string Category { get; init; }

    /// <summary>"reflection" for a sign for reflection; absent for a miracle.</summary>
    public string? Type { get; init; }

    /// <summary>Its stop on the journey for readers new to Islam, from 1; absent if it isn't on it.</summary>
    public int? Journey { get; init; }

    public required LocalizedText Title { get; init; }

    /// <summary>The question its page opens with.</summary>
    public required LocalizedText Hook { get; init; }

    /// <summary>One or two sentences for its card.</summary>
    public required LocalizedText Summary { get; init; }

    /// <summary>The verses or hadith it rests on; the first leads its card.</summary>
    public required IReadOnlyList<Scripture> Evidence { get; init; }

    /// <summary>What people knew or believed when it was revealed, paragraph by paragraph.</summary>
    public required IReadOnlyList<LocalizedText> Then { get; init; }

    /// <summary>What has since been found, paragraph by paragraph.</summary>
    public required IReadOnlyList<LocalizedText> Now { get; init; }

    /// <summary>"history" when the "now" paragraphs are history, a prophecy or a manuscript, rather than science.</summary>
    public string? NowLabel { get; init; }

    public required Highlight Highlight { get; init; }
    public required IReadOnlyList<Milestone> Timeline { get; init; }

    /// <summary>The page's closing thought.</summary>
    public required LocalizedText Reflection { get; init; }

    /// <summary>An honest note on how far the link between the text and the finding goes.</summary>
    public required LocalizedText Caution { get; init; }

    public LocalizedText? DidYouKnow { get; init; }
    public required IReadOnlyList<Source> Sources { get; init; }

    /// <summary>The name of its image in public/images.</summary>
    public required string Art { get; init; }

    // A method, not a property: the JSON reader would take a "kind" key in a file for a property's, and drop it.
    public SignKind Kind() => Type == "reflection" ? SignKind.Reflection : SignKind.Miracle;

    string IAggregateRoot.Key => Slug;
}

public enum SignKind
{
    /// <summary>A sign offered as a miracle.</summary>
    Miracle,

    /// <summary>A sign to reflect on: true and plainly meant, but known when it was revealed, so not offered as a miracle.</summary>
    Reflection,
}

/// <summary>A verse (or a few) of the Qur'an, or a hadith, its Arabic exactly as in the Mushaf or the collection.</summary>
/// <param name="Meaning">In Arabic a short gloss of its key words; in other languages a translation of its meaning.</param>
/// <param name="Ref">«الذاريات: ٤٧» / "Adh-Dhariyat 51:47", or the hadith's collection and number.</param>
/// <param name="Narrator">For a hadith: who narrated it.</param>
public sealed record Scripture(
    ScriptureKind Kind, string Text, LocalizedText Meaning, LocalizedText Ref, LocalizedText? Narrator = null);

/// <summary>One large figure for the page, such as «١٣٠٠ عام», "between the verse and Hubble".</summary>
public sealed record Highlight(LocalizedText Value, LocalizedText Label);

/// <summary>A dated step on the way from revelation to discovery.</summary>
/// <param name="Revelation">True for the step where the scripture came; absent otherwise.</param>
public sealed record Milestone(MilestoneYear Year, LocalizedText Text, bool? Revelation = null);

/// <summary>A milestone's year: a plain year such as "1929", its digits shown in each language's own, or a text in each language.</summary>
[JsonConverter(typeof(MilestoneYearJson))]
public sealed record MilestoneYear(string? Plain, LocalizedText? Text);

/// <summary>Where a claim can be checked.</summary>
/// <param name="Publisher">The journal, agency, university or publisher.</param>
public sealed record Source(string Title, string Publisher, string Url, SourceKind Kind, string? Year = null);

public enum SourceKind
{
    Journal,

    /// <summary>Not peer-reviewed yet.</summary>
    Preprint,

    Agency,
    University,
    Encyclopedia,
    Book,

    /// <summary>A science news report or a press release.</summary>
    News,
}

// The data files write a year as a string or as a text in each language, and so does this.
internal sealed class MilestoneYearJson : JsonConverter<MilestoneYear>
{
    public override MilestoneYear Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => reader.TokenType switch
    {
        JsonTokenType.String => new(reader.GetString(), null),
        JsonTokenType.StartObject => new(null, ReadText(ref reader, options)),
        _ => throw new JsonException(), // the serializer says where, and what it couldn't convert
    };

    // A read within a converter counts its place from the year, so its error goes on without one, and the
    // serializer gives it the year's.
    private static LocalizedText? ReadText(ref Utf8JsonReader reader, JsonSerializerOptions options)
    {
        try
        {
            return JsonSerializer.Deserialize<LocalizedText>(ref reader, options);
        }
        catch (JsonException e)
        {
            throw new JsonException(e.Message.Split(" Path: ")[0], e);
        }
    }

    public override void Write(Utf8JsonWriter writer, MilestoneYear value, JsonSerializerOptions options)
    {
        if (value.Plain is { } plain)
            writer.WriteStringValue(plain);
        else
            JsonSerializer.Serialize(writer, value.Text, options);
    }
}
