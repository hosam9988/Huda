using System.Reflection;
using System.Runtime.InteropServices;
using Huda.Application.Signs;
using Huda.Domain.Signs;
using Microsoft.AspNetCore.Mvc;

namespace Huda.IntegrationTests;

/// <summary>Clean architecture's rule: every dependency points inward, toward the domain.</summary>
public sealed class ArchitectureTests
{
    private static readonly Assembly Domain = typeof(Sign).Assembly;
    private static readonly Assembly Application = typeof(SignCatalog).Assembly;
    private static readonly Assembly Infrastructure = typeof(Huda.Infrastructure.DependencyInjection).Assembly;
    private static readonly Assembly Api = typeof(Program).Assembly;

    private static string[] ReferencesOf(Assembly assembly) =>
        [.. assembly.GetReferencedAssemblies().Select(reference => reference.Name!)];

    // Whether an assembly is part of .NET itself: one that ships with the runtime, rather than in a package.
    private static bool IsDotnet(string name) =>
        File.Exists(Path.Combine(RuntimeEnvironment.GetRuntimeDirectory(), name + ".dll"));

    [Fact]
    public void The_domain_depends_on_nothing_but_dotnet() =>
        Assert.All(ReferencesOf(Domain), name => Assert.True(IsDotnet(name), name));

    [Fact]
    public void The_application_depends_only_on_the_domain()
    {
        string[] allowed = ["Huda.Domain", "Microsoft.Extensions.DependencyInjection.Abstractions", "Microsoft.Extensions.Logging.Abstractions"];

        Assert.All(ReferencesOf(Application), name => Assert.True(IsDotnet(name) || allowed.Contains(name), name));
    }

    [Fact]
    public void The_infrastructure_knows_no_host()
    {
        var references = ReferencesOf(Infrastructure);

        Assert.DoesNotContain("Huda.Api", references);
        Assert.DoesNotContain(references, name => name.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal));
    }

    [Fact]
    public void The_api_reaches_the_database_only_through_the_use_cases()
    {
        Assert.DoesNotContain(ReferencesOf(Api), name =>
            name.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.Ordinal) || name.StartsWith("Npgsql", StringComparison.Ordinal));

        // The controllers take the use cases, never a repository.
        var parameters = Api.GetTypes()
            .Where(type => type.IsSubclassOf(typeof(ControllerBase)))
            .SelectMany(controller => controller.GetConstructors())
            .SelectMany(constructor => constructor.GetParameters())
            .ToList();
        Assert.NotEmpty(parameters);
        Assert.All(parameters, parameter => Assert.True(
            parameter.ParameterType.Namespace is "Huda.Application.Signs" or "Huda.Application.Names",
            $"{parameter.Member.DeclaringType!.Name} takes a {parameter.ParameterType.Name}."));
    }
}
