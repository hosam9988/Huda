using Huda.Application.Names;
using Huda.Domain.Names;
using Microsoft.AspNetCore.Mvc;

namespace Huda.Api.Controllers;

/// <summary>The Beautiful Names.</summary>
[ApiController]
[ResponseCache(Duration = 300, VaryByHeader = "Origin")]
public sealed class NamesController(NameCatalog names) : ControllerBase
{
    /// <summary>The names' cards, in order, or those a search finds.</summary>
    [HttpGet("api/names")]
    public Task<IReadOnlyList<NameCard>> List([FromQuery(Name = "")] NameFilter filter, CancellationToken cancellationToken) =>
        names.ListAsync(filter, cancellationToken);

    /// <summary>A name's page, as in names.json.</summary>
    [HttpGet("api/names/{slug}")]
    public async Task<ActionResult<DivineName>> Get(string slug, CancellationToken cancellationToken) =>
        await names.GetAsync(slug, cancellationToken) is { } name ? name : NotFound();

    /// <summary>names.json itself.</summary>
    [HttpGet("api/content/names")]
    public Task<NamesContent> Content(CancellationToken cancellationToken) => names.ContentAsync(cancellationToken);
}
