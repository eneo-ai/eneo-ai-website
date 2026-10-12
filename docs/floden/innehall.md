# Flöden och Tal till text: innehåll för eneo.ai

Källtext för sidorna `floden.html` och `tal-till-text.html`. Varje påstående är kontrollerat mot källkoden eller mot skärmbilderna; beläggen står i `verifiering.md`. Texten är granskad av GPT 6.1 Sol den 12 oktober 2026; vilka synpunkter som arbetats in och vilka som avvisats står sist i `verifiering.md`.

Begrepp som används genomgående: flöde, steg, körning, utkast, publicerad version, AI-byggaren, yta (en arbetsyta i Eneo med egna medlemmar och behörigheter), bevisunderlag (dokumentationen av en körnings instruktioner, underlag och svar), körningshistorik, gallring, rättslig spärr, säkerhetsklassificering, flödespaket, talaridentifiering (att skilja talare åt), talarmappning (att koppla talare till deltagare), modul.

---

## Sida 1: Flöden

**Etikett:** Flöden

**Rubrik:** Flöden kopplar ihop uppgifter i fast ordning

**Ingress:** Ett flöde bearbetar underlag i en bestämd ordning. Det tar emot text, dokument och ljud och skapar text, JSON eller dokument. Ni bygger flödet manuellt eller med AI-byggaren, och varje steg kan pausa för granskning av en människa. Körningshistoriken visar hur resultatet togs fram.

**Introduktion:** Ett flöde kan transkribera ljudet från ett nämndmöte, bearbeta texten med ett regelverk som underlag, låta en handläggare granska noteringarna och skapa en PDF-rapport. Samma upplägg passar remissvar, beslutsunderlag och andra ärenden med fasta steg. Flödet körs i Eneo, AI-plattformen som tillhandahåller modellerna, kunskapskällorna och behörigheterna.

### Eneo, flöden och moduler

Eneo är AI-plattformen. Ett flöde beskriver hur underlag bearbetas i steg med bestämd ordning. En modul är en separat webbapp som använder publicerade flöden och tillför gränssnittet för ett visst arbetsmoment.

| Lager | Ansvar |
| --- | --- |
| Eneo, AI-plattformen | Modeller för språk och transkribering. Kunskapskällor. Ytor, det vill säga arbetsytor med egna medlemmar och behörigheter. Säkerhetsklasser, loggning och API. |
| Flöden, bearbetningen | Stegen, deras underlag och resultat, och granskningspunkterna. Publiceras i versioner och körs många gånger. |
| Moduler, gränssnittet | Användarens kontroller och resultatvyer för ett arbetsmoment. Tal till text tillför inspelning, strömning och visning av transkriberingar och dokument. |

### Flödets steg bearbetar underlag i fast ordning

Ett flöde har ett steg eller tiotals steg, beroende på uppgiften. Varje steg anger var underlaget kommer från, hur det bearbetas och vilket resultat steget ger. Ordningen låses när flödet publiceras. Modellen ändrar den inte under körning.

**Diagram, exempel på ett flöde:**

| | Steg | Läser | Ger |
| --- | --- | --- | --- |
| IN | Ljud från nämndmötet | Skickas in när flödet körs. Regelverket bifogades när flödet byggdes. | |
| 1 | Transkribera ljudet | Ljudet | Text, med talare om talaridentifiering är ansluten |
| 2 | Plocka ut beslut och åtgärder | Steg 1 | Svar i fast format (JSON) |
| Paus | Granskning | Handläggaren läser underlag och svar och godkänner, rättar eller avvisar | |
| 3 | Skriv rapporttexten | Steg 1 och 2, med regelverket som underlag | Text |
| 4 | Skapa PDF | Steg 3 | PDF-dokument |
| UT | PDF-rapport och transkribering | | Kommer ut ur varje körning |

**Indata till flödet**

| Indata | Beskrivning |
| --- | --- |
| Formulärfält | Text, siffror, datum, enkelval, flerval och listor. Fälten fylls i när flödet körs. |
| Dokument | PDF, Word (DOCX), PowerPoint (PPTX), Excel (XLSX), CSV, Markdown, textfiler, JSON och XML. Filer i de äldre formaten DOC och PPT avvisas; de behöver sparas som DOCX respektive PPTX. |
| Ljud | MP3, M4A, WAV, OGG, WebM och MP4. |
| Hämtning från API | Ett steg kan hämta sitt underlag med HTTP GET från ett API eller en webbadress innan det körs. Installationen bestämmer vilka adresser som får nås. |

**Vad ett steg gör**

| Stegtyp | Beskrivning |
| --- | --- |
| Modellsteg | En språkmodell med instruktion och valfri kunskapskälla. Modellen svarar med löpande text eller med JSON som senare steg kan läsa fält ur. |
| Transkribering | Ljud blir text med installationens transkriberingsmodell. Om en tjänst för talaridentifiering är ansluten märks replikerna med talare. |
| Talarmappning | Modellen föreslår vilken deltagare varje talare är. En person bekräftar eller rättar innan flödet fortsätter. |
| Sammansättning | Text byggs ihop av tidigare steg och formulärsvar enligt en mall, utan modell. |
| Dokument | Steget fyller i en Word-mall via mallens innehållskontroller, eller skapar ett dokument i PDF- eller DOCX-format av texten. |
| Leverans | Steget skickar resultatet till ett annat system med HTTP POST. Leveransen kan upprepas, och varje försök registreras. |

**Utdata:** text i Markdown, svar i fast format (JSON), PDF, Word (DOCX) eller leverans till ett annat system.

**Avgränsningar:** MCP-verktyg i flödessteg byggs nu och ingår inte än; tills dess används MCP-verktyg via assistenter i Eneo. Ett steg kan hämta underlag med HTTP GET och leverera resultat med HTTP POST, men HTTP POST stöds inte som källa för stegets indata. Bilder tas inte emot som underlag.

### En människa kan granska varje steg

Ett steg kan ställas in så att körningen pausar när steget är klart. Den som granskar ser stegets underlag och svar bredvid varandra och godkänner, ändrar eller avvisar svaret. Först då fortsätter eller avslutas körningen.

- **Granskning per steg, inte bara i slutet.** Den som bygger flödet väljer vilka steg som ska granskas: alla, några eller inga. Ett flöde som transkriberar och sammanfattar kan pausa efter transkriberingen, efter sammanfattningen eller efter båda.
- **Ändringar förs vidare.** Rättar granskaren svaret går den rättade versionen in i nästa steg. Talarmappning är ett sådant steg: modellen föreslår vem som sa vad, en person bekräftar, och transkriberingen skrivs om med namnen.
- **Beslutet dokumenteras.** Varje granskning sparas med vem som beslutade, vad som ändrades och när. En körning som ingen granskar avbryts efter granskningsfönstret, som standard 14 dagar.
- **Mindre automation bias, högre kvalitet.** Den som får ett färdigt dokument tenderar att godta det. Den som ser modellens svar bredvid underlaget, innan svaret används, upptäcker fel där de uppstår. Granskningen kostar tid i de steg som granskas, och ger i gengäld en leverans som verksamheten kan stå för.

### AI-byggaren föreslår ett flöde utifrån uppgiften

Ett flöde byggs manuellt, steg för steg, eller med AI-byggaren. AI-byggaren är det rekommenderade sättet att börja. Den ställer frågor om uppgiften, visar sin tolkning och föreslår en plan. Flödesutkastet skapas när ni godkänner planen. Därefter kan utkastet ändras manuellt eller med AI-byggaren, och publiceras när det är klart.

1. **Eneo förstår uppgiften.** Ni beskriver uppgiften med egna ord och kan bifoga regler och styrdokument som underlag. AI-byggaren ställer en fråga i taget, med sitt förslag markerat; en fråga kan lämnas till Eneo att avgöra. Till sist visas tolkningen: syfte, indata, slutresultat och antaganden. Varje rad kan ändras.
2. **Eneo utformar planen.** Planen beskriver stegen, deras underlag och resultat, skälen till upplägget och flödets begränsningar. Ni kan begära en ändring i text, till exempel: "Lägg till en sammanfattning på första sidan."
3. **Du granskar innan det skapas.** Ni granskar planen som diagram eller i detalj. Godkännandet skapar utkastet. Ingenting körs.

AI-byggaren kan också öppnas på ett befintligt flöde. Vid redigering rekommenderar den att behålla befintliga val, men ni kan begära ändringar, och varje ändring visas innan den genomförs.

Flödets steg, indata, utdata och kopplingar visas som ett diagram i redigeraren. Diagrammet kan laddas ner som bild, till exempel till en redovisning av hur ett ärende hanteras.

Bilder, en per steg och i samma ordning som produktens egen stegindikator: `05-ai-byggaren-fraga-alternativ.png`, `07-ai-byggaren-utformar.png`, `08-ai-byggaren-plan.png`. Bildtext till den tredje: Exempel från AI-byggaren: uppgiften "Ljudfilen från ett nämndmöte ska transkriberas och bli en strukturerad PDF-rapport" gav en plan med fem steg.

### Körningshistoriken visar version, underlag och resultat

Ett flöde publiceras som en oföränderlig version med kontrollsumma. Varje körning är knuten till den publicerade version som användes. Ändringar i utkastet efteråt påverkar inte körningen.

**Diagram, livscykel:** Utkast (ändras manuellt eller med AI-byggaren) → Publicerad version (oföränderlig, med kontrollsumma) → Körning (knuten till versionen, kan pausa för granskning) → Historik (steg för steg, med bevisunderlag; gallras enligt regel, spärr stoppar).

- **Historik.** Historiken visar pågående och avslutade körningar med status, version, starttid och varaktighet.
- **Per steg.** För varje steg visas den faktiska instruktionen, underlaget, svaret, använda modeller, antal försök och felsökningsuppgifter.
- **Token.** Antalet token som skickats till och från modellen visas per steg och för hela körningen, enligt leverantörens rapportering. Saknad eller ofullständig uppgift märks ut.
- **Bevisunderlag.** Bevisunderlaget är dokumentationen av körningens instruktioner, underlag och svar. Om flödet tillåter export kan det laddas ner som JSON, i rå eller maskerad form. Varje nedladdning loggas med angivet skäl.

Underlaget visar hur resultatet togs fram, så att det kan granskas i efterhand och inte bara godtas.

### Säkerhetsklassificering, gallring och behörigheter

- **Säkerhetsklassificering.** Organisationen definierar sina säkerhetsklasser. Ytan har en klass, och varje modell har en. Vid publicering kontrolleras att stegets modell uppfyller den klass som ytan, tidigare steg och kunskapskällor kräver. Ett steg kan ge sitt resultat en högre klass, aldrig en lägre. Klasserna visas med organisationens egna namn.
- **Gallring.** Eneo får en gemensam gallringsmotor för chattar, appar och uppladdade filer. Flöden ansluts i nästa steg med samma regler. Verksamheten sätter lagringstiden per yta eller flöde, i dagar. Utan lagringstid gallras inget automatiskt. Varje natt raderas de körningar vars tid har gått ut, som en helhet: körningen med uppladdade filer, inspelningar och skapade dokument. Varje radering loggas som antal och regel, aldrig som innehåll.
- **Rättslig spärr.** En rättslig spärr hindrar gallring av den körningshistorik den gäller, till exempel medan en begäran om utlämnande handläggs. För spärren registreras vem som lade den, skälet, tidpunkten, när den ska omprövas och hur länge den gäller.
- **Behörigheter.** Särskilda behörigheter krävs för att hantera gallringsregler och rättsliga spärrar. Ändringar loggas med gammalt och nytt värde.

**Diagram, gallring:** Dag 0 (körningen avslutas, lagringstiden börjar räknas) → Lagringstiden går ut (till exempel efter 30 dagar; ingen tid, ingen gallring) → Natten därpå (motorn kontrollerar regeln igen och raderar allt eller inget; en spärr stoppar) → Loggat (antal och regel, aldrig innehåll).

**Status:** Gallringsmotorn byggs nu (eneo-ai/eneo, pull request 1064). Flödenas gallringsregler, granskningskö och rättsliga spärrar finns redan på flödesgrenen.

### Flödespaket kan användas i andra Eneo-installationer

Ett flöde kan exporteras som ett flödespaket i formatet `.eneopkg` och importeras i en annan Eneo-installation. Så delar en kommun ett flöde med en annan.

- **Ingår:** stegens inställningar och instruktioner, formulärfälten, vilka modeller och kunskapskällor stegen kräver, och Word-mallar om avsändaren väljer det.
- **Ingår inte:** körningshistorik, inloggningsuppgifter och de modeller och kunskapskällor som används lokalt. Vid import kopplar mottagaren flödet till sina egna modeller och kunskapskällor. Importen blir ett utkast som granskas och publiceras lokalt.

**Planerat:** En gemensam marknadsplats för flöden är planerad men ännu inte byggd (eneo-ai/eneo, issue 546): en versionshanterad katalog där en organisation publicerar ett flöde och en annan installerar det efter sin egen administratörs godkännande.

### Fast ordning, varierande modellsvar

Flödets steg körs i en bestämd ordning som modellen inte ändrar. Modellens svar kan däremot variera mellan körningar. Därför dokumenterar körningshistoriken bearbetningen, och steg kan ställas in för granskning. I litteraturen kallas mönstret prompt chaining (Anthropic) eller sekventiella agenter (Google ADK, SequentialAgent). Eneo använder ordet flöden, eftersom modellen inte väljer ordningen under körningen.

**Avslut (CTA):** Tal till text är en modul byggd på flöden. Teknisk dokumentation (docs.eneo.ai). Källkod (GitHub).

---

## Sida 2: Tal till text

**Etikett:** Modul

**Rubrik:** Tal till text gör ljud till transkribering och dokument

**Ingress:** Tal till text tar emot ljud genom strömning, inspelning eller filuppladdning. Det valda flödet i Eneo bestämmer hur ljudet bearbetas och vad som skapas: en transkribering, och ett dokument när flödet är byggt för det. Modulen är en webbapp för mobiltelefon, surfplatta och dator.

**Introduktion:** Modulen gör inget AI-arbete själv. Den loggar in användaren via Eneo, kör ett publicerat flöde och visar resultatet. Flödet beskriver bearbetningen. Modulen tillför det ett möte kräver: mikrofon, strömmad text, en spelare som följer texten och en vy för rättningar.

**Diagram, ljud in och resultat ut:** Strömma, Spela in, Ladda upp → Flödet i Eneo (transkribering, talaridentifiering, bearbetning, dokument) → Transkribering med talare, PDF eller Word.

### Från ljud till resultat i ett valt flöde

1. **Välj ett flöde.** Ni väljer ett publicerat flöde som ni har tillgång till. Listan är ordnad efter yta, och varje flöde beskriver sitt resultat, till exempel "Transkriberar mötet och skapar en PDF-rapport med beslut och sammanfattning".
2. **Lägg till ljudet.** Ni kan strömma ljud och se texten under tiden, spela in och transkribera efteråt eller ladda upp en ljudfil. Deltagare anges i förväg, och mikrofonen kan testas innan inspelningen börjar.
3. **Eneo kör flödet.** Ljudet transkriberas med installationens transkriberingsmodell. Om talaridentifiering är ansluten märks replikerna med talare, och ett steg för talarmappning låter er koppla talarna till deltagare innan körningen fortsätter.
4. **Resultatet.** Om flödet skapar ett dokument förhandsvisas det och kan laddas ner som PDF eller Word. Transkriberingen visas replik för replik med talare och tid. Ni kan söka, filtrera per talare och kopiera texten. När ljudet spelas upp följer textvisningen uppspelningen. Ni kan rätta transkriberingen och skapa dokumentet igen med rättningarna.

Bilder: `09-ttt-valj-flode.png`, `11-ttt-stromma.png`, `12-ttt-livetext.png`, `13-ttt-resultat.png`, `14-ttt-rattningar.png` (bildtext: Rättningar sparas per ändring. Dokumentet skapas igen från den rättade transkriberingen.)

### Inspelning och användning på olika enheter

- Inspelningen sparas på enheten varannan sekund. Efter en omladdning, en krasch eller en utgången inloggning finns inspelningen kvar, utom som mest de senaste två sekunderna, och kan skickas eller fortsättas.
- Om mikrofonen försvinner, till exempel vid ett inkommande samtal, pausas inspelningen. Ni kan fortsätta i en ny del av samma inspelning.
- Uppladdning och start av körning görs om vid nätverksfel. Varje försök använder samma nyckel, så att Eneo skapar en körning per inspelning.
- Gränssnittet testas mot WCAG 2.2 AA vid skärmbredder från 320 till 3440 pixlar, i ljust och mörkt läge, med pekskärm, tangentbord och 200 procents zoom. Kontrollerna har en träffyta på minst 44 pixlar på pekskärm.
- Organisationens namn och logotyp anges i konfigurationen och visas i sidhuvudet.

### Inloggning via Eneo och visning av säkerhetsklass

Användaren loggar in via Eneo, som överför inloggningen till modulen med en engångsbiljett. Modulens API-nyckel och användarens åtkomsttoken lagras på modulens server; webbläsaren har bara ett slumpmässigt sessions-id. Spärras användaren, nyckeln eller modulen i Eneo gäller det från nästa anrop. Modulen visar flödets säkerhetsklass med organisationens benämning, till exempel "Öppen information".

### Talaridentifiering med Vemsa

Talaridentifieringen görs av Vemsa, en fristående tjänst med öppen källkod. Namnet kommer från frågan "vem sa?". Eneos transkriberingsmodell omvandlar ljud till text. Vemsa skiljer talarna åt och anger var i ljudet varje ord ligger, så att varje replik kan spelas upp. Talarna kopplas sedan till deltagare i flödets talarmappning. Tjänsten ansluts i Eneos administration under Modeller, Transkription, och varje yta ges tillgång till den.

### Bakgrund: från transkribering till resultat

Projektet började med en idé om att transkribera samtal. Transkriberingen görs av den modell som väljs i Eneo, till exempel KB-Whisper. Nästa behov var att sammanställa transkriberingen, bearbeta den med regelverk och andra underlag och skapa en strukturerad rapport. Det gör ett flöde. Internt kallar vi arbetssättet tal till resultat.

**Avslut (CTA):** Modulen på GitHub. Vemsa på GitHub. Läs om flöden.
