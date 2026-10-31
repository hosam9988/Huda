using Huda.Domain;
using Microsoft.EntityFrameworkCore;

namespace Huda.Infrastructure.Persistence;

/// <summary>The repository of each kind of entity, over its table of <see cref="Row{T}"/>.</summary>
internal sealed class Repository<T>(HudaDbContext db) : IRepository<T>
    where T : class, IAggregateRoot
{
    private DbSet<Row<T>> Rows => db.Set<Row<T>>();

    public async Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken) =>
        await Rows.OrderBy(r => r.Position).Select(r => r.Document).ToListAsync(cancellationToken);

    // PostgreSQL refuses text with a NUL character, and no key has one.
    public async Task<T?> GetAsync(string key, CancellationToken cancellationToken) => key.Contains('\0')
        ? null
        : await Rows.Where(r => r.Key == key).Select(r => r.Document).FirstOrDefaultAsync(cancellationToken);

    public async Task ReplaceAllAsync(IReadOnlyList<T> entities, CancellationToken cancellationToken)
    {
        // One transaction: readers see the old rows until all the new ones are there.
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await Rows.ExecuteDeleteAsync(cancellationToken);
        Rows.AddRange(entities.Select((entity, position) => new Row<T> { Key = entity.Key, Position = position, Document = entity }));
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        db.ChangeTracker.Clear();
    }
}
