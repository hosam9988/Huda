using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Huda.IntegrationTests;

/// <summary>The OpenAPI document, served in development, describes the responses as the API writes them.</summary>
public sealed class OpenApiTests
{
    [Fact]
    public async Task Describes_the_responses_as_they_are()
    {
        await using var api = new WebApplicationFactory<Program>();
        using var client = api.CreateClient();
        var document = await client.GetStringAsync("/openapi/v1.json", TestContext.Current.CancellationToken);
        var schemas = JsonNode.Parse(document)!["components"]!["schemas"]!.AsObject();

        // Enums by name, and only their names.
        Assert.Equal(["miracle", "reflection"], schemas["SignKind"]!["enum"]!.AsArray().Select(value => (string)value!));

        // What can be absent is left out of a response, so no schema may require it: a name whose page isn't
        // written yet has no content, for example.
        Assert.True(CanBeNull(schemas["DivineName"]!["properties"]!["content"]));
        foreach (var (name, schema) in schemas)
        {
            foreach (var required in schema!["required"] as JsonArray ?? [])
                Assert.False(CanBeNull(schema["properties"]?[(string)required!]), $"{name}.{required} can be null, yet is required.");
        }
    }

    // Whether a schema allows null: its type includes "null", or one of its oneOf or anyOf schemas does.
    private static bool CanBeNull(JsonNode? schema) =>
        schema?["type"] switch
        {
            JsonArray types => types.Any(type => (string?)type == "null"),
            JsonValue type => (string?)type == "null",
            _ => false,
        }
        || (schema?["oneOf"] as JsonArray ?? []).Concat(schema?["anyOf"] as JsonArray ?? []).Any(CanBeNull);
}
