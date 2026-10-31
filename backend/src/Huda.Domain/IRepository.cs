namespace Huda.Domain;

/// <summary>
/// An entity that is stored and found on its own, by its key: a field of knowledge, a sign or a name. Each
/// implements the key explicitly, so that it doesn't become part of the content's JSON.
/// </summary>
public interface IAggregateRoot
{
    string Key { get; }
}

/// <summary>The stored entities of one kind, as the last import left them.</summary>
public interface IRepository<T>
    where T : class, IAggregateRoot
{
    /// <summary>All of them, in the content's order.</summary>
    Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken);

    Task<T?> GetAsync(string key, CancellationToken cancellationToken);

    /// <summary>Replaces all of them with these, in this order, in one go.</summary>
    Task ReplaceAllAsync(IReadOnlyList<T> entities, CancellationToken cancellationToken);
}
