using Huda.Application.Import;
using Huda.Domain;

namespace Huda.UnitTests;

/// <summary>A repository in memory.</summary>
internal sealed class InMemoryRepository<T>(params T[] entities) : IRepository<T>
    where T : class, IAggregateRoot
{
    public IReadOnlyList<T> Entities { get; private set; } = entities;

    public Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken) => Task.FromResult(Entities);

    public Task<T?> GetAsync(string key, CancellationToken cancellationToken) =>
        Task.FromResult(Entities.FirstOrDefault(entity => entity.Key == key));

    public Task ReplaceAllAsync(IReadOnlyList<T> entities, CancellationToken cancellationToken)
    {
        Entities = entities;
        return Task.CompletedTask;
    }
}

/// <summary>A content source that has this content.</summary>
internal sealed class FakeSource(SiteContent content) : IContentSource
{
    public Task<SiteContent> ReadAsync(CancellationToken cancellationToken) => Task.FromResult(content);
}
