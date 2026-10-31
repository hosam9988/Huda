using System.Text.Json;
using Huda.Domain.Names;
using Huda.Domain.Signs;
using Microsoft.EntityFrameworkCore;

namespace Huda.Infrastructure.Persistence;

/// <summary>The database: a table for each kind of entity, each row an entity kept whole as a jsonb document.</summary>
public sealed class HudaDbContext(DbContextOptions<HudaDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder model)
    {
        Table<Category>(model, "categories");
        Table<Sign>(model, "signs");
        Table<DivineName>(model, "names");
    }

    private static void Table<T>(ModelBuilder model, string name)
        where T : class => model.Entity<Row<T>>(row =>
        {
            row.ToTable(name);
            row.HasKey(r => r.Key);
            row.Property(r => r.Document).IsRequired().HasColumnType("jsonb").HasConversion(
                entity => JsonSerializer.Serialize(entity, ContentJson.Options),
                json => JsonSerializer.Deserialize<T>(json, ContentJson.Options)!);
        });
}

/// <summary>A stored entity: its key, its place in the content's order, and the entity itself.</summary>
internal sealed class Row<T>
{
    public required string Key { get; init; }
    public int Position { get; init; }
    public required T Document { get; init; }
}
