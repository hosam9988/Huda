# The API

An API for the site's content: the fields of knowledge, the signs and the Beautiful Names, and their images.
It runs on ASP.NET Core 10 with controllers and keeps the content in PostgreSQL through Entity Framework Core.
A migrator fills the database from the site's own data files. The code follows clean architecture and
domain-driven design, with repositories, kept as small as it can be: see [Architecture](#architecture).

The site doesn't use the API yet; it still reads `public/data`. See
[Switching the site to the API](#switching-the-site-to-the-api).

## How it works

- **The data files stay the source.** You still edit `public/data/ayat.json` and `names.json` and run
  `npm run check:content`. The migrator then copies the files into the database, replacing what was there,
  so it can be run again safely. Each table is replaced in one transaction, so a table whose new rows the
  database refuses keeps the rows it had.
- **The entities have the files' shape.** A sign in the code is a sign in `ayat.json`, field for field. The
  files are read straight into the entities, the database keeps each entity as it is, and the API returns it
  as it is, so there is no mapping code. `/api/content/*` returns the data files exactly, and a test checks it.
- **The files are read strictly.** A field that is missing, null where a value is needed, or unknown stops
  the import, and the migrator says where, such as `ayat.json: … Path: $.ayat[0].timeline[0].year`. So a new
  field reaches the backend before the data uses it, rather than being lost on the way: add it as a property
  to the entity in `Huda.Domain`. The content must also keep the rules the API relies on
  (`SiteContent.Problems`): every key fits in a URL and is used once; every sign is in a listed field and has
  a verse or hadith; no two signs share a journey stop, and the stops count from 1; a sign's type is
  `reflection` or absent; and no two names share a number. The migrator lists every problem it finds, and
  imports nothing.
- **One row per field, sign and name:** its key, its place in the file, and the entity as `jsonb`. The
  database is built from the repo, so the repo is also its backup.
- **The images are served from `public/images` as they are,** by the names the content uses:
  `/img/expansion.webp`, and `/img/expansion-sm.webp` for the small copy.
- **Search works like the site's search box,** following the same rules as
  [`search.ts`](../src/app/core/utils/search.ts):
  - **Signs:** every word must appear in a sign's title, summary, hook, or verses and their references.
  - **Arabic:** compared without tashkeel, with the alef, hamza, yaa and taa marbuta forms unified, so
    «السماء» finds «ٱلسَّمَآءِ».
  - **Other text:** compared without case, apostrophes or hyphens.
  - **Names:** found by the name with or without «ال», the transliteration, the meaning or the number.
  - **Whitespace:** a search is split and trimmed as JavaScript does it, so a pasted zero-width no-break
    space doesn't change the result.

  The rules live in the domain (`SignSearch`, `NameSearch`), and the use cases run them over the content in
  memory: there are 65 signs and 107 names, so a search still answers in about 10 ms. The rules were checked
  against the site's own functions over 914 searches, every verse and every name's meaning among them, and
  the results were identical. The one difference is that they also ignore the Qur'an's open tanween. A search
  can be up to 500 characters long, enough for a pasted verse.

## Architecture

Clean architecture: each layer depends only on the layers inside it, and the domain at the centre depends on
nothing but .NET.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Huda.Api, Huda.Migrator: the hosts, HTTP and the console                             │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Huda.Infrastructure: the repositories on PostgreSQL, the data files              │ │
│ │ ┌──────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Huda.Application: the use cases                                              │ │ │
│ │ │ ┌──────────────────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Huda.Domain: the entities, their rules and the repositories' interfaces  │ │ │ │
│ │ │ └──────────────────────────────────────────────────────────────────────────┘ │ │ │
│ │ └──────────────────────────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

| Project | Holds | Depends on |
| --- | --- | --- |
| [`Huda.Domain`](src/Huda.Domain) | The model, in domain-driven design's terms. The aggregate roots are `Category`, `Sign` and `DivineName`, each stored and found by its key (`IAggregateRoot`). Their parts are value objects, written as records: `LocalizedText`, `Scripture`, `Milestone`, `Source`, `NamePage`… The domain services are the search (`SignSearch`, `NameSearch`, `TextNormalizer`) and the reading order (`ReadingOrder`). `SiteContent` holds the rules across the content, and `IRepository<T>` is the repositories' interface. | nothing |
| [`Huda.Application`](src/Huda.Application) | The use cases: `SignCatalog` and `NameCatalog` for reading, with the filters and cards they take and give; `ContentImporter` for importing, with `IContentSource`, the interface it reads the content through. | the domain |
| [`Huda.Infrastructure`](src/Huda.Infrastructure) | One repository class for every kind of entity, on EF Core and PostgreSQL (`Persistence`, with the migrations), and the reader of the data files (`SiteContentSource`). | the application |
| [`Huda.Api`](src/Huda.Api) | Two controllers, each action a call to a use case. `Program.cs` is the composition root. | the application, and the infrastructure only to wire it in |
| [`Huda.Migrator`](src/Huda.Migrator) | A console that migrates the database and runs the import. | the same |

- **The use cases are tested without a database,** on repositories in memory.
- **The rule is checked.** `ArchitectureTests` fails if a layer depends on an outer one:
  - the domain may reference only .NET's own assemblies;
  - the application, only the domain and two `Microsoft.Extensions` abstractions;
  - the infrastructure, no host;
  - the API, neither EF Core nor Npgsql, and its controllers may take only use cases.

```
tests/Huda.UnitTests           the domain's rules and the use cases, in memory
tests/Huda.IntegrationTests    PostgreSQL, the files and HTTP, and the layers' rule
docker-compose.yml             PostgreSQL, the API and Caddy, for a server
```

## Endpoints

| Request | Returns |
| --- | --- |
| `GET /api/categories` | The fields in order, each with its number of miracles and of signs for reflection |
| `GET /api/signs` | The signs' cards in reading order, filtered by `category`, `kind` (`miracle` or `reflection`), `journey=true` (then stop by stop) or `q` |
| `GET /api/signs/{slug}` | A sign's page, as in `ayat.json` |
| `GET /api/names` | The names' cards in order, filtered by `q` |
| `GET /api/names/{slug}` | A name's page, as in `names.json` |
| `GET /api/content/signs` | `ayat.json` |
| `GET /api/content/names` | `names.json` |
| `GET /img/{name}.webp`, `GET /img/{name}-sm.webp` | An image, and its small copy |
| `GET /health` | Whether the database answers |

- **Formats:** responses are JSON with camelCase names. A field that is absent in the data is left out,
  never sent as null. Errors are Problem Details (`application/problem+json`).
- **Caching:** content and images may be cached for five minutes. Content varies by `Origin`, since only
  the site's own requests get the CORS header; images carry an ETag, so a browser checks back cheaply.
- **Documentation:**
  - In development, the OpenAPI document is at `/openapi/v1.json`.
  - [`Huda.Api.http`](src/Huda.Api/Huda.Api.http) has a request for every endpoint.

## Running locally

You need the .NET 10 SDK and PostgreSQL 18. From this folder:

1. Give both programs the database's password. They connect to
   `Host=localhost;Port=5433;Database=huda;Username=postgres`: PostgreSQL 18's installer takes port 5433
   when 17 already has 5432. The simplest place for the password is PostgreSQL's own password file, which
   psql reads too: `%APPDATA%\postgresql\pgpass.conf` on Windows, `~/.pgpass` elsewhere. It takes one line:

   ```
   localhost:5433:*:postgres:the-password
   ```

   For another server, set the whole connection string in `ConnectionStrings__Huda` instead. Either way, the
   user needs to be allowed to create the database.

2. Create and fill the database. Run this again whenever the data changes:

   ```bash
   dotnet run --project src/Huda.Migrator
   ```

   A database that an earlier version of the backend made has other tables: drop it first
   (`DROP DATABASE huda;`), and the migrator builds it again from the repo.

3. Start the API at http://localhost:5000:

   ```bash
   dotnet run --project src/Huda.Api
   ```

Settings come from `appsettings.json` or from environment variables:

| Setting | Default |
| --- | --- |
| `ConnectionStrings__Huda` | `Host=localhost;Port=5433;Database=huda;Username=postgres`, with the password from the password file |
| `Site__Public` | The repo's `public` folder: the migrator reads `data/` in it, and the API serves `images/` |
| `Cors__Origins__0`, `__1`… | The site, `https://hosam9988.github.io`; in development also `http://localhost:4200` and `:4201` |

After changing a table (`HudaDbContext.OnModelCreating`), add a migration with `dotnet tool restore`, then
`dotnet ef migrations add <Name> --project src/Huda.Infrastructure --startup-project src/Huda.Migrator --output-dir Persistence/Migrations`.
The entities are stored as `jsonb`, so changing one needs no migration.

## Tests

```bash
dotnet test --solution Huda.slnx
```

The tests are in two projects (see [Architecture](#architecture)). The unit tests need nothing. The
integration tests against PostgreSQL share one database: each run creates it, fills it with the site's real
content as the migrator does, and drops it at the end. A test that changes the content must put it back.
These tests are skipped unless `HUDA_TEST_DB` names a server where they may create databases:

```bash
HUDA_TEST_DB="Host=localhost;Username=postgres;Password=…" dotnet test --solution Huda.slnx
```

GitHub Actions ([`backend.yml`](../.github/workflows/backend.yml)) runs all of them, and builds the
Docker images, whenever the backend or the site's data changes.

## Deploying

On a Linux server with Docker:

1. Point a DNS `A` record for the API's address, such as `api.example.com`, at the server. Ports 80 and
   443 must be open.
2. Clone the repo, and in `backend/` copy `.env.example` to `.env` and fill it in.
3. Start the database, fill it, then start everything:

   ```bash
   docker compose up -d db
   docker compose run --rm migrator
   docker compose up -d
   ```

Caddy gets the HTTPS certificate on its first start; then `https://api.example.com/health` should answer
`Healthy`.

- **After the site's data changes:** `git pull`, then `docker compose run --rm migrator`. The images need
  only the pull, since the API serves the repo's own files.
- **After the backend's code changes:** `git pull`, then build both images before running either, so the
  old API meets the new rows only while it is being replaced:

  ```bash
  docker compose build api migrator
  docker compose run --rm migrator
  docker compose up -d
  ```

  The migrator applies any new migration, then imports again. Until it is replaced, the old API skips a
  field it doesn't know, but can't read a value it doesn't know, such as a new kind of source.
- **Changing the database password:** PostgreSQL keeps the password it was first created with, whatever
  `.env` says later. Change it in the database first, then in `.env`:

  ```bash
  docker compose exec db psql -U huda -d huda -c "ALTER ROLE huda PASSWORD 'the-new-password'"
  docker compose up -d
  ```

The database is built from the repo, so a new server needs only these same steps: there is nothing else to
back up. That changes if the database ever holds anything the repo doesn't, such as readers' accounts.

## Switching the site to the API

The site reads `data/ayat.json` in
[`content.service.ts`](../src/app/core/services/content.service.ts) and `data/names.json` in
[`names.service.ts`](../src/app/core/services/names.service.ts). The switch is those two URLs:

- `https://api.example.com/api/content/signs`
- `https://api.example.com/api/content/names`

Their responses are the same files. To load the images from the API too, change `images/` in
[`art.ts`](../src/app/core/utils/art.ts) to `https://api.example.com/img/`. Until then they keep coming from
the site.

Switch only once the API is deployed, since the site then depends on the server being up.
