namespace Huda.Domain.Signs;

/// <summary>The orders the site lists signs in.</summary>
public static class ReadingOrder
{
    /// <summary>The miracles, then the signs for reflection, each by field in the fields' order, then as they come.</summary>
    public static IReadOnlyList<Sign> Sort(IEnumerable<Sign> signs, IReadOnlyList<Category> categories)
    {
        var field = categories.Index().ToDictionary(c => c.Item.Id, c => c.Index);
        // OrderBy is stable, so within a field the signs keep the order they came in.
        return [.. signs.OrderBy(s => s.Kind()).ThenBy(s => field.GetValueOrDefault(s.Category, int.MaxValue))];
    }

    /// <summary>The signs on the journey for readers new to Islam, stop by stop.</summary>
    public static IReadOnlyList<Sign> Journey(IEnumerable<Sign> signs) =>
        [.. signs.Where(s => s.Journey is not null).OrderBy(s => s.Journey)];
}
