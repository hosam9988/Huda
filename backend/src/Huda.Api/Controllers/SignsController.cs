using Huda.Application.Signs;
using Huda.Domain.Signs;
using Microsoft.AspNetCore.Mvc;

namespace Huda.Api.Controllers;

/// <summary>The signs, and the fields of knowledge they are grouped under.</summary>
/// <remarks>Content may be cached for five minutes, by Origin, since only the site's requests get CORS headers.</remarks>
[ApiController]
[ResponseCache(Duration = 300, VaryByHeader = "Origin")]
public sealed class SignsController(SignCatalog signs) : ControllerBase
{
    /// <summary>Every field, in the site's order, with how many signs of each kind it has.</summary>
    [HttpGet("api/categories")]
    public Task<IReadOnlyList<CategoryCard>> Categories(CancellationToken cancellationToken) => signs.CategoriesAsync(cancellationToken);

    /// <summary>The signs' cards, filtered by field, kind, journey or search; with no filter, all in reading order.</summary>
    /// <remarks>Name = "" binds the filters from the query's own keys, even if it also has a key named "filter".</remarks>
    [HttpGet("api/signs")]
    public async Task<ActionResult<IReadOnlyList<SignCard>>> List(
        [FromQuery(Name = "")] SignFilter filter, CancellationToken cancellationToken)
    {
        if (filter.Category is { } id && !await signs.CategoryExistsAsync(id, cancellationToken))
        {
            ModelState.AddModelError("category", $"There is no field '{id}'.");
            return ValidationProblem(ModelState);
        }
        return Ok(await signs.ListAsync(filter, cancellationToken));
    }

    /// <summary>A sign's page, as in ayat.json.</summary>
    [HttpGet("api/signs/{slug}")]
    public async Task<ActionResult<Sign>> Get(string slug, CancellationToken cancellationToken) =>
        await signs.GetAsync(slug, cancellationToken) is { } sign ? sign : NotFound();

    /// <summary>ayat.json itself: the fields and the signs.</summary>
    [HttpGet("api/content/signs")]
    public Task<SignsContent> Content(CancellationToken cancellationToken) => signs.ContentAsync(cancellationToken);
}
