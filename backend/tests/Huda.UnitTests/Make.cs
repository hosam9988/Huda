using Huda.Domain;
using Huda.Domain.Names;
using Huda.Domain.Signs;

namespace Huda.UnitTests;

/// <summary>Small content for the tests, each piece changeable by name.</summary>
internal static class Make
{
    public static LocalizedText Text(string arabic, string? english = null) => new(arabic, english);

    public static Category Category(string id = "cosmos") => new()
    {
        Id = id,
        Title = Text("الكون", "The Cosmos"),
        Blurb = Text("من بداية الكون", "From the beginning"),
        Art = "expansion",
    };

    public static Scripture Verse(string text = "وَٱلسَّمَآءَ بَنَيۡنَٰهَا", string reference = "Adh-Dhariyat 51:47") =>
        new(ScriptureKind.Quran, text, Text("بقوة", "with strength"), Text("الذاريات: ٤٧", reference));

    public static Sign Sign(
        string slug = "expanding-universe",
        string category = "cosmos",
        string? type = null,
        int? journey = null,
        string title = "اتساع الكون",
        string englishTitle = "The expanding universe",
        IReadOnlyList<Scripture>? evidence = null) => new()
    {
        Slug = slug,
        Category = category,
        Type = type,
        Journey = journey,
        Title = Text(title, englishTitle),
        Hook = Text("هل يتسع الكون؟", "Is the universe expanding?"),
        Summary = Text("آية عن السماء", "A verse about the heaven"),
        Evidence = evidence ?? [Verse()],
        Then = [Text("كان الناس يرون السماء ثابتة")],
        Now = [Text("اكتشف هابل")],
        Highlight = new(Text("١٣٠٠ عام"), Text("بين الآية وهابل")),
        Timeline = [new(new MilestoneYear("1929", null), Text("هابل"))],
        Reflection = Text("تأمل"),
        Caution = Text("بحذر"),
        Sources = [new("A Relation", "PNAS", "https://example.org/hubble", SourceKind.Journal, "1929")],
        Art = "expansion",
    };

    public static DivineName Name(
        string slug = "allah",
        int number = 1,
        string name = "اللَّهُ",
        string transliteration = "Allah",
        string gloss = "The One truly worshipped",
        string? meaning = "المعبود بحق") => new()
    {
        Slug = slug,
        Number = number,
        Name = name,
        Transliteration = transliteration,
        Gloss = gloss,
        Content = meaning is null
            ? null
            : new NamePage(
                Text(meaning, "The One truly worshipped, the Deity of all creation"),
                [new NameText(ScriptureKind.Quran, "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ", Text("طه: ٨"), Text("شرح"))],
                Text("أثره"),
                new NameText(ScriptureKind.Quran, "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ", Text("طه: ٨"), Text("شرح"))),
    };
}
