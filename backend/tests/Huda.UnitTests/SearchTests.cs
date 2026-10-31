using Huda.Domain.Names;
using Huda.Domain.Signs;

namespace Huda.UnitTests;

public sealed class SearchTests
{
    [Fact]
    public void A_blank_search_is_no_search()
    {
        Assert.Null(SignSearch.Parse(null));
        Assert.Null(SignSearch.Parse("  \t "));
        Assert.Null(NameSearch.Parse(""));
    }

    [Fact]
    public void A_sign_search_needs_every_word_without_tashkeel_or_case()
    {
        var sign = Make.Sign();

        Assert.True(SignSearch.Parse("السماء")!.Matches(sign)); // its summary, without the madda
        Assert.True(SignSearch.Parse("ٱلسَّمَآءِ  بنينها")!.Matches(sign)); // and its verse
        Assert.False(SignSearch.Parse("بنيناها")!.Matches(sign)); // the verse's dagger alef goes, as on the site
        Assert.True(SignSearch.Parse("EXPANDING adh-dhariyat")!.Matches(sign)); // English, and the reference
        Assert.False(SignSearch.Parse("السماء mountains")!.Matches(sign)); // every word, not any
    }

    [Fact]
    public void A_word_with_no_latin_left_is_looked_for_as_arabic_only()
    {
        // "Adh-Dhariyat" keeps its hyphen as Arabic, so a lone hyphen finds it; as Latin text nothing is left of
        // the hyphen, and nothing must not find everything.
        Assert.True(SignSearch.Parse("-")!.Matches(Make.Sign()));
        Assert.False(SignSearch.Parse("-")!.Matches(Make.Sign(evidence: [Make.Verse(reference: "Adh Dhariyat 51:47")])));
    }

    [Theory]
    [InlineData("رحمن", true)] // without «ال»
    [InlineData("الرَّحْمَٰنُ", true)] // with tashkeel
    [InlineData("ar rahman", true)] // the transliteration, without spaces
    [InlineData("Ar-Rahman", true)]
    [InlineData("merciful", true)] // the meaning
    [InlineData("2", true)] // the number
    [InlineData("3", false)]
    [InlineData("قدوس", false)]
    public void A_name_is_found_by_its_arabic_transliteration_meaning_or_number(string query, bool found)
    {
        var name = Make.Name("ar-rahman", 2, "الرَّحْمَٰنُ", "Ar-Rahman", "The Most Merciful", "ذو الرحمة");

        Assert.Equal(found, NameSearch.Parse(query)!.Matches(name));
    }

    [Fact]
    public void Al_alone_searches_the_meanings_but_not_the_names()
    {
        Assert.False(NameSearch.Parse("ال")!.Matches(Make.Name(name: "الرَّحْمَٰنُ", meaning: null)));
        Assert.True(NameSearch.Parse("ال")!.Matches(Make.Name(meaning: "المعبود بحق")));
    }
}
