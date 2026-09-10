# Överlämning: offentlig roadmap på eneo.ai

Det här dokumentet beskriver vad som är klart i `eneo-ai/eneo` och vad som
återstår i `eneo-ai/eneo-ai-website` för att publicera en automatiskt uppdaterad
roadmap på eneo.ai.

Målet är att Project 5 ska vara den mänskliga källan till roadmapen. Webbplatsen
ska visa en säker, offentlig projektion av samma information utan en separat,
manuellt underhållen lista.

## Kort version

Efter att [PR #570](https://github.com/eneo-ai/eneo/pull/570) har mergats:

1. `eneo-ai/eneo` skapar JSON-artifakten `eneo-roadmap-public-json` var sjätte
   timme.
2. Webbplatsens workflow hämtar den senaste lyckade artifakten.
3. Webbplatsen validerar `schemaVersion`, översätter endast titel och
   sammanfattning till svenska och återanvänder cachade översättningar.
4. Webbplatsen committar endast ändrad genererad data.
5. `roadmap.html` renderar grupperna Pågår, Härnäst, Senare och Levererat.
6. Om hämtning, validering eller översättning misslyckas ligger den senaste
   fungerande roadmapen kvar på webbplatsen.

Webbplatsen ska inte läsa den privata projektboarden, parsa issue-mallar eller
klassificera epics på nytt.

## Länkar

- Project 5, roadmap-vyn:
  <https://github.com/orgs/eneo-ai/projects/5/views/4>
- Export-workflow:
  <https://github.com/eneo-ai/eneo/actions/workflows/export-roadmap.yml>
- Implementations-PR:
  <https://github.com/eneo-ai/eneo/pull/570>
- Roadmapens kanoniska arbetsflöde:
  [`PROJECT_WORKFLOW.md`](./PROJECT_WORKFLOW.md)
- Exporter:
  [`scripts/export_github_roadmap.mjs`](../scripts/export_github_roadmap.mjs)

## Det som är implementerat i `eneo-ai/eneo`

PR #570 utökar det befintliga roadmap-flödet. Den skapar inget parallellt
system.

### Automatisk export

Workflowet `Export roadmap graph`:

- körs vid minut 17 var sjätte timme;
- läser Project 5 med det befintliga `ADD_TO_PROJECT_PAT`;
- skapar en offentlig JSON-projektion;
- laddar upp den som `eneo-roadmap-public-json`;
- behåller artifakten i 30 dagar;
- gör inga Project-ändringar under schemalagda körningar.

Manuella exporter i Markdown, Mermaid och SVG finns kvar. De kan innehålla
intern Project-information, behålls i en dag och får inte användas av
webbplatsen.

### Offentlig avgränsning

JSON-exporten tar endast med poster som:

- är epics enligt det befintliga Project 5-flödet;
- är riktiga GitHub-issues, inte Project draft items;
- tillhör exakt `eneo-ai/eneo`;
- har ett issue-nummer och en GitHub-URL.

Exporten använder en uttrycklig fältlista. Nya Project-fält blir därför inte
publika av misstag.

Varje publikt roadmapobjekt innehåller endast:

| Fält             | Betydelse                                             |
| ---------------- | ----------------------------------------------------- |
| `number`         | Epicens issue-nummer                                  |
| `url`            | Länk till den publika epicen                          |
| `title`          | Epicens originaltitel                                 |
| `summary`        | Hela innehållet under epicens `Summary`-rubrik        |
| `status`         | Status från Project 5                                 |
| `roadmapVersion` | Planeringsversion från Project 5 eller issue-fallback |
| `area`           | Område                                                |
| `priority`       | Prioritet                                             |
| `startDate`      | Startdatum, om angivet                                |
| `targetDate`     | Måldatum, om angivet                                  |
| `group`          | `in_progress`, `next`, `later` eller `delivered`      |

Envelope-fälten är:

| Fält                   | Betydelse                                                |
| ---------------------- | -------------------------------------------------------- |
| `schemaVersion`        | Nuvarande kontraktsversion är `1`                        |
| `generatedAt`          | När källexporten skapades                                |
| `source`               | `eneo-ai`, Project `5` och `eneo-ai/eneo`                |
| `groups`               | Gruppernas stabila ordning                               |
| `unpublishedItemCount` | Antal epic-poster i Project 5 som inte är publika issues |
| `items`                | Den publika listan                                       |

Inga befintliga eller framtida epics är hårdkodade. Exporten läser aktuell data
vid varje körning. De issue-nummer som finns i exporterns self-test är syntetisk
testdata och används aldrig i produktion.

### Gruppregler

Exportern, inte webbplatsen, äger klassificeringen:

| Grupp på webbplatsen | Värde i JSON  | Regel                                                                              |
| -------------------- | ------------- | ---------------------------------------------------------------------------------- |
| Pågår                | `in_progress` | Aktiv, startad eller blockerad Project-status                                      |
| Härnäst              | `next`        | `Todo` i den tidigaste konkreta numeriska releasefamiljen bland publika Todo-epics |
| Senare               | `later`       | Övriga öppna, framtida, oschemalagda eller okända statusar                         |
| Levererat            | `delivered`   | Project-status som motsvarar Done, Closed, Complete, Completed eller Merged        |

`Roadmap version` är fri text. Nya versioner kräver ingen kodändring. `2.X`,
`Future` och tomma värden hamnar inte i Härnäst.

### Transparenssignal

`unpublishedItemCount` visar hur många epic-nivåposter i Project 5 som inte kan
publiceras. Det kan till exempel vara Project draft items.

Exporten avslöjar inte titel eller annan information från dessa poster. Den
fortsätter samtidigt att uppdatera den publika delen så att webbplatsen inte
blir inaktuell.

Vid verifieringen den 23 juli 2026 var värdet `2`. Det är en
nulägesobservation, inte ett värde som ska hårdkodas. Teamet bör konvertera
sådana poster till publika epic-issues eller ändra deras klassificering om de
inte hör hemma på den offentliga roadmapen.

## Det kollegan ska implementera i webbplatsrepot

Arbetet nedan sker i `eneo-ai/eneo-ai-website`. Ingen av dessa filer ska läggas
i `eneo-ai/eneo`.

### 1. Vänta på merge och verifiera källexporten

När PR #570 är mergad till `develop`:

1. Öppna `Actions -> Export roadmap graph -> Run workflow`.
2. Välj `format: json`.
3. Välj `audience: default`.
4. Kör workflowet.
5. Kontrollera att körningen skapar artifakten
   `eneo-roadmap-public-json`.
6. Ladda ned artifakten och kontrollera att filen heter `roadmap.json` och har
   `schemaVersion: 1`.

Manuell JSON-export är en startkontroll. Den schemalagda körningen tar sedan
över.

### 2. Skapa en begränsad lästoken

Skapa en fine-grained GitHub-token för webbplatsens workflow:

- repository access: endast `eneo-ai/eneo`;
- Actions: read-only;
- ingen Projects-behörighet;
- ingen write-behörighet till `eneo-ai/eneo`;
- välj en rimlig utgångstid och dokumentera vem som roterar tokenen.

Spara tokenen som repository secret i webbplatsrepot:

```text
ROADMAP_ARTIFACT_TOKEN
```

Webbplatsens vanliga `GITHUB_TOKEN` kan inte läsa artifacts från ett annat
repository. `ROADMAP_ARTIFACT_TOKEN` används endast för nedladdningen från
`eneo-ai/eneo`.

Om översättningen använder Anthropic ska även detta secret finnas endast i
webbplatsrepot:

```text
ANTHROPIC_API_KEY
```

Lägg aldrig tokenvärden i workflowfiler, loggar, genererade JSON-filer eller
översättningscache.

### 3. Skapa webbplatsens workflow

Skapa exempelvis `.github/workflows/roadmap.yml` med:

- `workflow_dispatch` för test och felsökning;
- ett schema som kör efter källexporten, exempelvis minut 47 var sjätte timme;
- `contents: write` endast om workflowet ska committa genererad webbdata;
- concurrency så två roadmapkörningar inte skriver samtidigt;
- pinnade commit-SHA:n för tredjeparts-actions.

Håll workflowet linjärt:

1. checka ut webbplatsrepot;
2. hämta senaste lyckade schemalagda källexport;
3. validera schema och obligatoriska fält;
4. översätt endast nya eller ändrade titlar och sammanfattningar;
5. bygg webbplatsens `data/roadmap.json`;
6. kör relevanta tester;
7. committa och pusha endast när genererade filer har ändrats.

Använd den senaste lyckade schemalagda körningen så här:

```bash
run_id="$(
  GH_TOKEN="$ROADMAP_ARTIFACT_TOKEN" gh run list \
    --repo eneo-ai/eneo \
    --workflow export-roadmap.yml \
    --event schedule \
    --status success \
    --limit 1 \
    --json databaseId \
    --jq '.[0].databaseId'
)"

test -n "$run_id"

source_dir="$(mktemp -d)"
trap 'rm -rf "$source_dir"' EXIT

GH_TOKEN="$ROADMAP_ARTIFACT_TOKEN" gh run download "$run_id" \
  --repo eneo-ai/eneo \
  --name eneo-roadmap-public-json \
  --dir "$source_dir"

test -f "$source_dir/roadmap.json"
```

Hämta till en temporär katalog. Ersätt inte webbplatsens senaste fungerande
data innan hela körningen har lyckats.

GitHub kör schemalagda workflows från repositoryts default branch. Workflowet
bör därför inte betraktas som aktivt förrän det är mergat där.

### 4. Validera källdatan före användning

Webbplatsens byggskript ska stoppa körningen om:

- `schemaVersion` saknas eller inte är exakt `1`;
- `source.owner`, `source.project` eller `source.repository` avviker;
- `groups` inte är exakt
  `in_progress`, `next`, `later`, `delivered` i den ordningen;
- `items` inte är en lista;
- ett objekt saknar obligatoriska fält;
- ett `group`-värde ligger utanför kontraktet;
- `url` inte pekar på ett issue i `https://github.com/eneo-ai/eneo/`;
- `unpublishedItemCount` inte är ett heltal som är minst noll.

Vid valideringsfel ska workflowet misslyckas utan att committa något. Den
senaste fungerande roadmapen ligger då kvar på webbplatsen och GitHub Actions
visar att uppdateringen behöver åtgärdas.

Webbplatsen ska avvisa okända schema-versioner. Den ska inte gissa hur ett nytt
kontrakt fungerar.

### 5. Översätt säkert och inkrementellt

Skicka endast dessa publika fält till översättningstjänsten:

- `title`;
- `summary`.

Skicka inte hela JSON-objektet. Status, datum, område, prioritet, version, grupp
och URL behöver ingen AI-bearbetning.

Översättningsinstruktionen ska kräva:

- saklig svenska;
- samma innebörd och ambitionsnivå som originalet;
- inga nya datum, leveranslöften, funktioner eller slutsatser;
- bevarade produktnamn och tekniska begrepp när översättning skulle ändra
  betydelsen;
- en kort titel och två till tre beskrivande meningar;
- maskinläsbart svar som valideras innan det sparas.

Använd `data/roadmap-translations.json` som cache. En cachepost bör knytas till
epicens issue-nummer och en hash av:

```text
title + NUL-tecken + summary
```

Ta inte med `generatedAt`, status, grupp eller andra planeringsfält i
översättningshashen. Då översätts en epic endast när dess läsbara innehåll
ändras, medan status- och gruppändringar ändå publiceras direkt.

Om ett AI-svar saknas eller inte följer det förväntade formatet ska hela
körningen misslyckas. Publicera inte tom, halvöversatt eller påhittad text.

### 6. Bygg den publika sidan

Följ webbplatsens befintliga sidmall och `DESIGN-GUIDE.md`. Lägg inte till en
ny designprofil.

Roadmapsidan ska:

- visa svensk titel och beskrivning;
- använda `group` direkt från JSON;
- visa område eller annan metadata endast när fältet har ett värde;
- länka varje kort till den publika epicens `url`;
- visa `generatedAt` som “Senast uppdaterad”;
- förklara att prioritering och tidplan kan ändras;
- dölja Levererat när gruppen är tom;
- visa eller tydligt uppmärksamma ett `unpublishedItemCount` större än noll;
- hantera tomma grupper och en helt tom roadmap utan JavaScript-fel.

Rendera text som text, inte som rå HTML. Sätt aldrig epicens titel eller
sammanfattning med osanerad `innerHTML`.

Ersätt den manuella sektionen “Planerade funktioner” på `versioner.html` med en
länk eller teaser till roadmapen. Lägg till Roadmap i navigeringen enligt
sajtens befintliga nav-mönster.

### 7. Commit-regler för genererad data

Workflowet ska:

- bara ändra webbplatsens genererade roadmapdata och översättningscache;
- kontrollera `git diff --quiet` före commit;
- göra noll commits när inget innehåll har ändrats;
- aldrig committa den temporärt nedladdade artifact-zippen eller tokens;
- använda webbplatsrepots vanliga botidentitet och branch policy.

`generatedAt` ändras vid varje källexport. Bestäm uttryckligen om webbplatsen
ska committa den nya tidsstämpeln även när inget annat har ändrats. För
transparens rekommenderas att den uppdateras efter varje lyckad körning, men
översättningscachen ska fortfarande förbli oförändrad.

## Löpande arbetssätt i Project 5

Automationen kan bara visa den information som teamet underhåller.

- Skapa roadmaparbete som publika epic-issues i `eneo-ai/eneo`.
- Lägg epicen i Project 5 och sätt `Kind: Epic`.
- Sätt Project-status när arbetet börjar, blockeras eller levereras.
- Sätt `Roadmap version` till en konkret planeringsversion när arbetet ska bli
  Härnäst.
- Använd `2.X`, `Future` eller `Unscheduled` för sådant som ligger senare.
- Fyll i Area, Priority, Start date och Target date när beslut finns.
- Lämna okända datum och ägare tomma; hitta inte på värden för att fylla
  roadmapen.
- Konvertera Project draft items till publika issues när de blir verkliga
  roadmapåtaganden.
- Stäng epic-issuen och sätt Project-status till Done när utfallet är
  levererat.

Detta är också innehållsarbetet bakom transparensen. Automatisk export löser
fördröjda webbuppdateringar, men den kan inte rätta gammal eller ofullständig
Project-data.

## Felhantering

| Fel                                      | Förväntat beteende                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Ingen lyckad källexport finns            | Webbworkflowet misslyckas och behåller senaste data                         |
| Artifact-token har gått ut               | Nedladdningen misslyckas utan att Project 5 exponeras                       |
| Okänd `schemaVersion`                    | Bygget stoppar före översättning och commit                                 |
| Anthropic är otillgängligt               | Ingen partiell data committas                                               |
| En epic saknar Summary                   | Visa titeln utan AI-skapad beskrivning och skriv en tydlig workflow-varning |
| `unpublishedItemCount` är större än noll | Roadmapen uppdateras, men transparensgapet visas eller larmas               |
| Levererat är tom                         | Sektionen döljs                                                             |
| Samma källdata hämtas igen               | Inga nya översättningsanrop; ingen cacheändring                             |

## Test- och acceptanskriterier i webbplatsrepot

Innan webbplats-PR:en mergas ska kollegan verifiera:

- [ ] Workflowet kan hämta artifakten med
      `ROADMAP_ARTIFACT_TOKEN`.
- [ ] Tokenen saknar Project- och write-behörighet till `eneo-ai/eneo`.
- [ ] Schema 1 accepteras och en okänd schema-version avvisas.
- [ ] Ett objekt i varje grupp renderas under rätt svensk rubrik.
- [ ] En tom Levererat-grupp döljs.
- [ ] Ett positivt `unpublishedItemCount` blir synligt eller skapar ett tydligt
      larm.
- [ ] Titlar, sammanfattningar och URL:er renderas utan HTML-injektion.
- [ ] Oförändrade texter använder översättningscachen.
- [ ] Ändrad titel eller Summary skapar en ny översättning.
- [ ] Ändrad status eller roadmapversion uppdaterar gruppen utan ny
      översättning.
- [ ] Ett hämtnings-, schema- eller översättningsfel lämnar senaste fungerande
      `data/roadmap.json` orörd.
- [ ] Workflowet skapar ingen commit när de filer som ska versionshanteras är
      oförändrade.
- [ ] `roadmap.html`, teaser på `versioner.html` och navigeringslänkar fungerar
      på mobil och desktop.
- [ ] “Senast uppdaterad” kommer från källans `generatedAt`.
- [ ] En manuell workflowkörning och den första schemalagda körningen lyckas
      efter merge.

## Avgränsningar

Bygg inte följande i webbplatsrepot:

- en ny GitHub Projects-klient;
- direktåtkomst till privata Project 5;
- en andra parser för epicens issue-body;
- hårdkodade epic-nummer, titlar, releases eller aktuella counts;
- egen gruppklassificering baserad på datum eller AI;
- fallback som publicerar intern Markdown, Mermaid eller SVG;
- en databas, webhooktjänst eller extra backend enbart för roadmapen.

Den enkla ansvarsfördelningen är avsiktlig:

```text
Project 5
  -> export_github_roadmap.mjs klassificerar och filtrerar
  -> eneo-roadmap-public-json är det offentliga kontraktet
  -> webbplatsen validerar, översätter och presenterar
```

Om webbplatsen behöver ett nytt källfält ska kontraktet ändras och
versionshanteras i `eneo-ai/eneo` först. Lägg inte till en separat dataväg runt
exportern.
