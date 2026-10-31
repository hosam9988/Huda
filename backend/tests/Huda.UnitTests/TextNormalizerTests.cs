using Huda.Domain;

namespace Huda.UnitTests;

public sealed class TextNormalizerTests
{
    [Theory]
    [InlineData("ٱلسَّمَآءِ", "السماء")] // alef wasla, shadda, madda, kasra
    [InlineData("بِأَيۡيْدࣲ", "باييد")] // the Qur'an's small sukun and open tanween
    [InlineData("مُوسَىٰ", "موسي")] // dagger alef and alef maqsura
    [InlineData("رَحْمَةً", "رحمه")] // ta marbuta
    [InlineData("مُؤْمِنٌ", "مومن")]
    [InlineData("شَيْءٍ تَبَارَكَ", "شيء تبارك")]
    [InlineData("إِنَّ ٱلْإِنسَٰنَ", "ان الانسن")] // the dagger alef goes too, as on the site
    [InlineData("بِسْـمِ", "بسم")] // tatweel
    public void Arabic_loses_tashkeel_and_letter_variants(string text, string normalized) =>
        Assert.Equal(normalized, TextNormalizer.NormalizeArabic(text));

    [Theory]
    [InlineData("Adh-Dhariyat  51:47", "adhdhariyat 51:47")]
    [InlineData("The Qur’an's `Words`", "the qurans words")]
    [InlineData("Ar Rahman", "ar rahman")]
    public void Latin_loses_case_apostrophes_and_hyphens(string text, string normalized) =>
        Assert.Equal(normalized, TextNormalizer.NormalizeLatin(text));

    [Fact]
    public void Words_are_split_on_any_run_of_spaces()
    {
        Assert.Equal(["sun", "moon"], TextNormalizer.Words("  sun \t moon "));
        Assert.Empty(TextNormalizer.Words("   "));
        Assert.Empty(TextNormalizer.Words(null));
    }

    [Fact]
    public void Whitespace_is_what_javascript_takes_for_it()
    {
        // U+FEFF, often pasted along with text, is whitespace to JavaScript; U+0085 is not.
        Assert.Equal(["السماء"], TextNormalizer.Words("\uFEFFالسماء"));
        Assert.Equal(["x", "y"], TextNormalizer.Words("x\uFEFFy"));
        Assert.Equal(["a\u0085b"], TextNormalizer.Words("a\u0085b"));
        Assert.Equal(["\u0085"], TextNormalizer.Words("\u0085"));
        Assert.Equal("a b", TextNormalizer.NormalizeLatin("a\u00A0\u3000b"));
    }
}
