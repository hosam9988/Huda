using Huda.Application;
using Huda.Application.Import;
using Huda.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

// Brings the database's schema up to date, then imports the site's data files into it. Its settings come from
// appsettings.json beside it or from the environment: ConnectionStrings__Huda, and Site__Public outside the repo.
var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings { Args = args, ContentRootPath = AppContext.BaseDirectory });
builder.Services.AddApplication().AddInfrastructure();

using var host = builder.Build();
await using var scope = host.Services.CreateAsyncScope();
try
{
    await scope.ServiceProvider.MigrateDatabaseAsync();
    await scope.ServiceProvider.GetRequiredService<ContentImporter>().ImportAsync();
    return 0;
}
catch (InvalidDataException e)
{
    host.Services.GetRequiredService<ILogger<Program>>().LogError("Nothing was imported. {Problems}", e.Message);
    return 1;
}
