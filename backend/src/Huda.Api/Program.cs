using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Unicode;
using Huda.Application;
using Huda.Infrastructure;
using Microsoft.Extensions.FileProviders;

// The composition root: the one place that knows every layer and wires them together.
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication().AddInfrastructure();
builder.Services.AddControllers().AddJsonOptions(json => UseContentJson(json.JsonSerializerOptions));
// The OpenAPI document is built with the app-wide JSON settings, not the controllers' own, so they get the same.
builder.Services.ConfigureHttpJsonOptions(json => UseContentJson(json.SerializerOptions));
// null isn't one of an enum's values, though the optional kind filter puts it there.
builder.Services.AddOpenApi(openApi => openApi.AddSchemaTransformer((schema, _, _) =>
{
    schema.Enum?.Remove(null!);
    return Task.CompletedTask;
}));
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks().AddDatabase();

// The site calls the API from its own address (GitHub Pages), so the API allows that origin to read it.
builder.Services.AddCors(cors => cors.AddDefaultPolicy(policy => policy
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [])
    .WithMethods("GET", "HEAD")));

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

// The site's own images, by the names the content uses: /img/expansion.webp, and /img/expansion-sm.webp for
// the small copy.
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Configuration.SiteFolder(), "images")),
    RequestPath = "/img",
    OnPrepareResponse = file => file.Context.Response.Headers.CacheControl = "public, max-age=300",
});

app.UseCors();
app.MapControllers();
app.MapHealthChecks("/health");
if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.Run();

// As the data files write it: camelCase names, enums by name, an absent value left out rather than sent as null
// (the site tests `a.journey !== undefined`), and Arabic as it is rather than as \u escapes.
static void UseContentJson(JsonSerializerOptions options)
{
    options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
    options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
}

/// <summary>The API's entry point, public for the tests' <c>WebApplicationFactory</c>.</summary>
public partial class Program;
