using System.Text.Json;
using System.Text.Json.Serialization;

namespace Huda.Infrastructure;

/// <summary>The JSON of the site's data files, which the database keeps each entity in too.</summary>
internal static class ContentJson
{
    /// <summary>camelCase names, enums by their camelCase names, and an absent value left out rather than null.</summary>
    public static JsonSerializerOptions Options { get; } = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false) },
    };

    /// <summary>
    /// For reading the files: a field that is missing, null where a value is needed, or unknown is an error, so
    /// nothing in them is lost on its way to the database. (An enum's name is matched loosely, in any case;
    /// <c>npm run check:content</c> checks it exactly.) The database's own rows are read leniently, so that an API
    /// a version behind skips a field that a newer import wrote.
    /// </summary>
    public static JsonSerializerOptions Strict { get; } = new(Options)
    {
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
        RespectNullableAnnotations = true,
        RespectRequiredConstructorParameters = true,
    };
}
