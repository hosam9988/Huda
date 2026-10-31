using Huda.Domain;
using Huda.Domain.Names;
using Huda.Domain.Signs;
using Microsoft.Extensions.Logging;

namespace Huda.Application.Import;

/// <summary>Where the content comes from: the site's data files.</summary>
public interface IContentSource
{
    /// <exception cref="InvalidDataException">A file is missing, or isn't the content's JSON.</exception>
    Task<SiteContent> ReadAsync(CancellationToken cancellationToken);
}

/// <summary>
/// Imports the content from its source, replacing what was imported before. The source stays the source of
/// truth: each import makes the stored content match it, so it can run again safely.
/// </summary>
public sealed class ContentImporter(
    IContentSource source,
    IRepository<Category> categories,
    IRepository<Sign> signs,
    IRepository<DivineName> names,
    ILogger<ContentImporter> logger)
{
    /// <exception cref="InvalidDataException">The content has problems, so nothing was imported.</exception>
    public async Task ImportAsync(CancellationToken cancellationToken = default)
    {
        var content = await source.ReadAsync(cancellationToken);
        var problems = content.Problems().ToList();
        if (problems.Count > 0)
            throw new InvalidDataException($"The content has {problems.Count} problem(s):\n" + string.Join('\n', problems));

        await categories.ReplaceAllAsync(content.Categories, cancellationToken);
        await signs.ReplaceAllAsync(content.Signs, cancellationToken);
        await names.ReplaceAllAsync(content.Names, cancellationToken);
        logger.LogInformation(
            "Imported {Categories} fields, {Signs} signs and {Names} names.",
            content.Categories.Count, content.Signs.Count, content.Names.Count);
    }
}
