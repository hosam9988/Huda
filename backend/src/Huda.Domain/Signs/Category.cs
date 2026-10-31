namespace Huda.Domain.Signs;

/// <summary>A field of knowledge the signs are grouped under, such as "cosmos": one of ayat.json's categories.</summary>
public sealed class Category : IAggregateRoot
{
    public required string Id { get; init; }
    public required LocalizedText Title { get; init; }

    /// <summary>One line under the title on the home page.</summary>
    public required LocalizedText Blurb { get; init; }

    /// <summary>The name of its image in public/images.</summary>
    public required string Art { get; init; }

    string IAggregateRoot.Key => Id;
}
