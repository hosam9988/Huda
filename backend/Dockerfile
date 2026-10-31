# Builds both programs; docker-compose.yml picks one with `target`.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# The project files first, so a code change doesn't download the packages again.
COPY Directory.Build.props Directory.Packages.props ./
COPY src/Huda.Domain/Huda.Domain.csproj src/Huda.Domain/
COPY src/Huda.Application/Huda.Application.csproj src/Huda.Application/
COPY src/Huda.Infrastructure/Huda.Infrastructure.csproj src/Huda.Infrastructure/
COPY src/Huda.Api/Huda.Api.csproj src/Huda.Api/
COPY src/Huda.Migrator/Huda.Migrator.csproj src/Huda.Migrator/
RUN dotnet restore src/Huda.Api/Huda.Api.csproj && dotnet restore src/Huda.Migrator/Huda.Migrator.csproj
COPY src/ src/
RUN dotnet publish src/Huda.Api -c Release -o /out/api --no-restore -p:UseAppHost=false \
 && dotnet publish src/Huda.Migrator -c Release -o /out/migrator --no-restore -p:UseAppHost=false

# The chiseled images have no shell or package manager and run as a non-root user. Each reads the part of the
# site's public folder it needs from /site, where docker-compose.yml mounts it.

FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS api
WORKDIR /app
COPY --from=build /out/api .
ENV Site__Public=/site
EXPOSE 8080
ENTRYPOINT ["dotnet", "Huda.Api.dll"]

FROM mcr.microsoft.com/dotnet/runtime:10.0-noble-chiseled AS migrator
WORKDIR /app
COPY --from=build /out/migrator .
ENV Site__Public=/site
ENTRYPOINT ["dotnet", "Huda.Migrator.dll"]
