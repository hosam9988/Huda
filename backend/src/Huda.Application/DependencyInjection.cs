using Huda.Application.Import;
using Huda.Application.Names;
using Huda.Application.Signs;
using Microsoft.Extensions.DependencyInjection;

namespace Huda.Application;

public static class DependencyInjection
{
    /// <summary>The use cases. The repositories and the content source they need come from the infrastructure.</summary>
    public static IServiceCollection AddApplication(this IServiceCollection services) => services
        .AddScoped<SignCatalog>()
        .AddScoped<NameCatalog>()
        .AddScoped<ContentImporter>();
}
