# Verifiering av påståendena om flöden och Tal till text

Datum: 2026-10-12. Källor: `eneo-ai/eneo` på grenen `feature/flows-and-builder` (commit `e51ee3a76`) och pull request 1064 (`feature/data-retention`, utkast), `eneo-ai/eneo-mod-speech-to-text` (`main`), `eneo-ai/vemsa` (`main`), `eneo-ai/eneo-marketplace` (`feature/marketplace-purpose-readme`), issue 546 i `eneo-ai/eneo`, underlaget "Så gallrar Eneo" för dataskyddsombudet, och de fjorton skärmbilderna i `public/images/floden/`. Filvägar nedan är relativa respektive repo.

Status: Stämmer = finns i koden, dokumentationen eller skärmbilderna. Delvis = finns, men inte så som det beskrevs. Byggs nu = under utveckling på en öppen gren eller pull request. Planerat = beslutat eller dokumenterat, inte byggt.

## Flöden

| Påstående | Status | Belägg |
| --- | --- | --- |
| Ett flöde skickar resultatet från ett steg till nästa i bestämd ordning | Stämmer | `docs/flows/flow-developer-quickstart.md` (`input_source`: `previous_step`, `all_previous_steps`), docs-site `flows.mdx`: "Flows execute sequentially". |
| Ett flöde kan ha ett steg, flera eller tiotals | Stämmer | `flows/flow_authoring_spec.py`: `MAX_FLOW_AUTHORING_STEPS = 256`. AI-byggarens granskning hanterar upp till 40 steg (`ai_builder_flow_review.py`). |
| Tar emot Word, PDF, ljudfiler med mera | Stämmer | `files/text.py` (PDF, DOCX, PPTX, XLSX, CSV, Markdown, TXT, JSON, XML), `files/audio.py` (MP3, M4A, WAV, OGG, WebM, MP4). `.doc` och `.ppt` avvisas med anvisning att spara som DOCX/PPTX (`files/mime_support.py`). Bilder: `input_type=image` är `supported=False` (`flows/type_policies.py`). |
| Formulärfält: text, siffror, datum, enkelval, flerval, lista | Stämmer | `frontend/apps/web/messages/sv.json`, `flow_package_error_form_field_type_unsupported`: "Text, Tal, Datum, Enkelval, Flerval eller Lista". Sidan skriver "siffror" för fälttypen Tal, för att inte blandas ihop med talat ljud. |
| Levererar JSON, PDF, Word, text (Markdown) | Stämmer | `output_type`: `text`, `json`, `pdf`, `docx`. Markdown-delmängd renderas till dokument (`flows/runtime/document_rendering/`). Word-mallar fylls via innehållskontroller (`flow-developer-quickstart.md`: "targets are Word content controls"). |
| MCP i varje steg | Byggs nu | På flödesgrenen avvisas MCP i flödessteg (`flows/application/flow_service.py`: "Flow MCP is unsupported"; `flows/runtime/executor.py`). Enligt ägaren pågår utvecklingen av MCP per steg nu. Sidan säger "byggs nu och ingår inte än". |
| Hämtar data via HTTP-anrop och API:er | Stämmer, med avgränsning | `input_source=http_get` hämtar underlag före steget; `output_mode=http_post` levererar resultat (minst en gång, bokförd per försök). HTTP POST som indata stöds inte. Adresser styrs av `main/destination_policy.py`. |
| Termen är "sekventiella agenter" | Delvis | Anthropic kallar mönstret prompt chaining och skiljer arbetsflöden (koden styr vägen) från agenter (modellen styr). Google ADK har byggstenen `SequentialAgent`. Sidan förklarar begreppet i ett kort avsnitt. |
| Flöden är deterministiska | Delvis | Orkestreringen är deterministisk: ordning, dataväg, publicerad version med kontrollsumma. Modellstegens innehåll är det inte. Sidan säger båda delarna. |
| Granskning av människa per steg | Stämmer | `review_policy` per steg; `flow_run_review_checkpoints` med revision; lägena godkänn, ändra, avvisa; `edited_value` blir stegets output (modulens `README.md`, avsnittet Granskning och talarmappning). Granskningsfönstret är 14 dagar som standard (modulens `README.md`, Tidsgränser). Granskningsbeslutet loggas med aktör (`docs/flows/external-transcription-service.md`: "Corrections and their required actor audit are committed together"). |
| Talarmappning skriver om transkriberingen med namnen | Stämmer | `flow-developer-quickstart.md`, avsnittet Speaker mapping: "Editing re-derives the text from the mapping and updates `{{transkribering}}`". |
| Byggs manuellt eller med AI-byggaren, AI-byggaren rekommenderas | Stämmer | `CreateFlowDialog.svelte` ("Rekommenderas"), skärmbild 01. |
| Filer kan skickas in som kontext till AI-byggaren | Stämmer | Byggarsessioner har bilagor som typad evidens (`flow-developer-quickstart.md`, Flow AI Builder). Skärmbild 02 visar "Bifoga filer", skärmbild 06 en bifogad fil med roll. |
| En fråga i taget, Eneos förslag markerat, låt Eneo välja | Stämmer | `recommended_option_id` och `delegated_question_answer` (`flow-developer-quickstart.md`); skärmbild 05 ("Eneo föreslår", "Låt Eneo välja åt mig"). |
| Tolkningen visas med syfte, indata, slutresultat, antaganden och Ändra per rad | Stämmer | Skärmbild 06; `is_derived`/`question_id` i sammanfattningen (`flow-developer-quickstart.md`). |
| Be AI-byggaren göra om ett steg eller hela flödet | Stämmer | "Be om en ändring" i planvyn (skärmbild 08), "Ändra" per rad i sammanfattningen, redigeringssessioner. |
| AI-byggaren redigerar befintliga flöden; rekommenderar att behålla nuvarande val | Stämmer | Fliken AI-byggaren på flödessidan (`routes/(app)/spaces/[spaceId]/flows/[flowId]/+page.svelte`); `current_option_id`, "the only thing Eneo recommends is keeping what the flow already does" (`flow-developer-quickstart.md`). |
| Exempel med fem steg | Stämmer | Skärmbild 08. Sidan presenterar det som ett exempel från AI-byggaren, inte som standard. |
| Visualisera stegen och ladda ner bilden | Stämmer | `FlowGraph.svelte`: diagram med indata, utdata och kopplingar; nedladdning som PNG (`flow_graph_download_png`). |
| Historik över körningar, pågående och avslutade | Stämmer | Fliken Historik (`FlowRunsTable.svelte`): status, version, starttid, varaktighet, sök och filter. |
| Token in och ut per steg och totalt | Stämmer, med förbehåll | `FlowRunTokenUsageBadge.svelte`, `TokenUsageBadge.svelte`, körningens `summary.token_usage`. Uppgiften kommer från leverantören; "inte registrerad" och "ofullständig" visas när den saknas. |
| Exakta prompten, resultatet, försöket och loggar per körning | Stämmer | `FlowRunEvidenceStepCard.svelte` (`effective_prompt`, underlag, svar), `flow_step_attempts`, diagnostik, `models_used`. |
| Historiken exporteras som bevisunderlag | Stämmer, med villkor | JSON-export (`flow-evidence-export.v18`) i rå eller maskerad form. Kräver att flödet tillåter nedladdning (`evidence_policy.allow_export`), loggas med skäl (`flow_run_evidence_router.py`). Felsökningsdata utan innehåll kan alltid hämtas. |
| Export och import av flöden | Stämmer | `.eneopkg` (`eneo/flow_packages/`): stegens inställningar, formulärfält, krav på modeller och kunskapskällor, Word-mallar valfritt. Körhistorik och inloggningsuppgifter ingår inte. Import skapar utkast; modeller mappas lokalt. |
| Versionshanterad marknadsplats | Planerat | `eneo-marketplace/README.md`: "Status: planning only." Epic: issue 546 i `eneo-ai/eneo` (roadmap "Future", prioritet P2). |
| Gallring | Byggs nu | Pull request 1064 (utkast, bas `develop`): en gemensam gallringsmotor för chattar, appar och uppladdningar; "The Flow tasks come in a later PR". Underlaget för dataskyddsombudet: nattlig körning 03.30 UTC, lagringstid per yta/assistent/app, ingen tid betyder ingen gallring, allt eller inget per post, loggas som antal och regel. På flödesgrenen finns redan gallringsregler per organisation/yta/flöde (`flow_run_retention_policy.py`), granskningskö och uttrycklig gallring (`flow_run_history_purge_repo.py`: körningen med källfiler, inspelningar och skapade dokument). Ingen gallring per steg. |
| Rättslig spärr | Stämmer | `flow_retention_hold_service.py`; docs-site `retention-policy.mdx`: "who placed it, why, when, when it is reviewed and until when"; gallring och redaktion av felsökningsdata hoppar över spärrade körningar. |
| Behörigheter för gallring och spärrar | Stämmer | `flow_retention_authz.py`: `retention_manage` och `retention_holds`. Ändringar loggas med gammalt och nytt värde (DPO-underlaget, avsnitt 3). |
| Säkerhetsklassificera ett flöde och dess steg | Stämmer | `flows/flow_security_classification.py`: stegets modell måste nå nivån som ytan, tidigare steg och kunskapskällor kräver; `output_classification_override` höjer stegets resultat; klasserna visas med organisationens namn (commit `3bc8403c2`). |
| En delad yta kan säkerhetsklassificeras | Stämmer | Ytans klass (`select_security_classification_for_space`) begränsar modeller och flödessteg. |

## Tal till text

| Påstående | Status | Belägg |
| --- | --- | --- |
| Modulen kör flöden under huven | Stämmer | `README.md`: run-contract, uppladdning per steg, körning, granskningscheckpoints. |
| Strömma, spela in eller ladda upp | Stämmer | `README.md`, avsnitten Strömma, Robust ljudinspelning. Live-text via `live-transcription-sessions` i Eneo. Skärmbilderna 10 och 11. |
| Deltagare i förväg och mikrofontest | Stämmer | Skärmbild 11 ("Deltagare", "Testa mikrofonen", "Mikrofonen hör dig"). |
| Listan ordnad efter yta | Stämmer | Skärmbild 09 visar grupper som Barn och utbildning, Kommunledningskontoret; `README.md`: flödeslistan omfattar användarens ytor. |
| Anpassad för surfplattor, mobiler och datorskärmar | Stämmer | Tillgänglighetsgrinden kör 320 till 3440 px, telefoner och surfplatta som pekskärm, 200 % zoom, 44 px med finger (`README.md`). Sidan skriver "testas mot WCAG 2.2 AA", inte "uppfyller". |
| Inspelningen sparas varannan sekund; fortsätt efter avbrott | Stämmer | `README.md`, Inspelningen sparas på enheten: "sparar en ljudbit varannan sekund i webbläsarens IndexedDB", "förlorar därför högst den senaste biten", "Fortsätt spela in". |
| Återförsök med samma nyckel | Stämmer | `README.md`: "Körningen startas med samma idempotensnyckel vid varje försök", "så att Eneo gör en körning per inspelning". |
| Organisationens logotyp i sidhuvudet | Stämmer | `README.md`, Egen organisation i sidhuvudet: `ORGANIZATION_NAME`, `ORGANIZATION_LOGO`. |
| Transkribering med KB-Whisper | Stämmer, som val | Transkriberingsmodellen väljs i Eneo. Vemsa är byggt för `KBLab/kb-whisper-large`. Sidan nämner KB-Whisper som exempel. |
| Talaridentifiering i flöden och i modulen | Stämmer | `docs/flows/external-transcription-service.md`: tjänst (Vemsa) ansluts under Modeller, Transkription, och varje yta ges tillgång; `speaker_mapping`-steg med granskning; modulens vy "Vem är vem?". |
| Vemsa anger var i ljudet varje ord ligger | Stämmer | Vemsas `README.md`: CTC forced alignment ger ordprecisa tidsstämplar; modulen använder ordtiderna för uppspelning (`README.md`, `transcript-words`). |
| Inloggning via Eneo, inga nycklar i webbläsaren, spärr gäller från nästa anrop | Stämmer | `README.md` (Eneo SSO: engångsticket, opakt sessions-id); docs-site `module-authentication.mdx`: "takes effect on the module's next backend request". |
| Säkerhetsklass visas i modulen | Stämmer | Skärmbild 10 ("Öppen information"); klasser visas med organisationens namn (commit `3bc8403c2`). |
| Rätta transkriberingen och skapa dokumentet igen | Stämmer | Skärmbild 14 ("Skapa dokumentet igen med rättningarna"), `transcript-corrections` med revision. |
| Modulkit för fler moduler | Planerat | `docs/plans/2026-10-01-module-platform-design.md`. Nämns inte på sidan. |

## Granskning av GPT 6.1 Sol, 12 oktober 2026

Granskaren läste källtexten och verifieringen med hög ansträngning och lämnade en prioriterad lista på tio ändringar. Så hanterades den:

**Arbetat in.** Ingresserna begränsar nu löftena (talaridentifiering villkorad, dokument när flödet är byggt för det). Skalmodellen beskriver ansvar i stället för metaforer och använder ordet flöde, inte sekventiell assistent. AI-byggarens redigering beskrivs korrekt: den kan ändra befintliga flöden och rekommenderar att behålla befintliga val. Talaridentifiering (skilja talare) och talarmappning (koppla till deltagare) hålls isär. Diagrammet flyttades till byggavsnittet. Rubrikerna är innehållsrubriker. Agentavsnittet kortades till ett stycke. "Tal" i formulärfält blev "siffror". Yta och bevisunderlag definieras vid första förekomsten. Gallringsavsnittet skrevs om helt, med den nya gallringsmotorn som grund. Aktiv form med "ni" i arbetsgångarna.

**Avvisat, med skäl.** Granskaren bad om belägg för ett antal uppgifter som saknades i den version av verifieringen den fick: tvåsekunderssparandet, återförsök med samma nyckel, spärrars genomslag vid nästa anrop, 44 pixlars träffyta, logotyp i konfigurationen, formulärfältstyper, Word-mallens innehållskontroller, byggarens frågedetaljer och femstegsexemplet. Samtliga är belagda i modulens `README.md`, i flödesdokumentationen eller i skärmbilderna; raderna ovan har kompletterats. Uppgifterna står kvar på sidorna, med försiktigare formuleringar där granskaren pekade på absoluta garantier.

## Att göra innan publicering

- Flöden ligger på grenen `feature/flows-and-builder` och är inte släppta i en version på `versioner.html`. Sidan publiceras när flöden ingår i en release.
- Gallringsmotorn (pull request 1064) och MCP per steg är under utveckling. Statusnoterna på sidan uppdateras när de är släppta.
- Navigeringen på övriga sidor saknar länken Flöden; den finns bara på de två nya sidorna.
- Skärmbilderna visar en demomiljö med fingerade namn och ett fingerat protokoll. Byt till godkända bilder före publicering.
- Länkarna till docs.eneo.ai pekar på sidan `docs/flows`, som finns på grenen men inte nödvändigtvis på den publicerade docs-sajten.
