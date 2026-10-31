using Huda.Domain;
using Huda.Domain.Signs;

namespace Huda.UnitTests;

public sealed class ContentTests
{
    [Fact]
    public void Content_that_keeps_the_rules_has_no_problems()
    {
        var content = new SiteContent(
            [Make.Category("cosmos"), Make.Category("earth")],
            [Make.Sign("a", "cosmos", journey: 1), Make.Sign("b", "earth", "reflection", journey: 2), Make.Sign("c", "earth")],
            [Make.Name("allah", 1), Make.Name("ar-rahman", 2)]);

        Assert.Empty(content.Problems());
    }

    [Fact]
    public void Finds_what_breaks_the_rules()
    {
        var content = new SiteContent(
            [Make.Category("cosmos"), Make.Category("cosmos"), Make.Category("Earth")],
            [
                Make.Sign("a", journey: 1),
                Make.Sign("a"),
                Make.Sign("b", "nowhere", journey: 1),
                Make.Sign("c", type: "legend", journey: 0, evidence: []),
                Make.Sign("cosmos\n"),
            ],
            [Make.Name("allah", 1), Make.Name("allah", 1)]);

        Assert.Equal(
            [
                "'Earth' must be lower-case letters and digits, in words joined by hyphens.",
                "'cosmos\n' must be lower-case letters and digits, in words joined by hyphens.",
                "Field 'cosmos' is listed twice.",
                "Sign 'a' is listed twice.",
                "Journey stop 1 is taken by two signs.",
                "Name 'allah' is listed twice.",
                "Number 1 is taken by two names.",
                "Sign 'b' is in field 'nowhere', which isn't listed.",
                "Sign 'c' has no verse or hadith.",
                "Sign 'c' has journey stop 0; the stops count from 1.",
                "Sign 'c' has type 'legend'; it must be 'reflection' or absent.",
            ],
            content.Problems());
    }

    [Fact]
    public void Lists_the_miracles_then_the_signs_for_reflection_each_by_field()
    {
        Category[] fields = [Make.Category("cosmos"), Make.Category("earth")];
        Sign[] signs =
        [
            Make.Sign("earth-reflection", "earth", "reflection"),
            Make.Sign("earth-miracle", "earth"),
            Make.Sign("cosmos-reflection", "cosmos", "reflection"),
            Make.Sign("cosmos-miracle-1", "cosmos"),
            Make.Sign("cosmos-miracle-2", "cosmos"),
        ];

        Assert.Equal(
            ["cosmos-miracle-1", "cosmos-miracle-2", "earth-miracle", "cosmos-reflection", "earth-reflection"],
            ReadingOrder.Sort(signs, fields).Select(s => s.Slug));
    }

    [Fact]
    public void Lists_the_journey_stop_by_stop()
    {
        Sign[] signs = [Make.Sign("third", journey: 3), Make.Sign("off"), Make.Sign("first", journey: 1)];

        Assert.Equal(["first", "third"], ReadingOrder.Journey(signs).Select(s => s.Slug));
    }
}
