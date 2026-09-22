# KomInn – ny løsning på SharePoint Framework (SPFx)

**Løsningsforslag til Asker kommune**
Utarbeidet av SoftwareOne · September 2026 · Versjon 0.9 (utkast til diskusjon)

---

## 1. Bakgrunn og mål

KomInn er Asker kommunes verktøy for å sende inn, vurdere og synliggjøre forslag til
kommunale tiltak, blant annet søknader om internt klimatilskudd. Dagens løsning er
bygget for «klassisk» SharePoint med skript som lastes inn på sidene, og bygger på
rammeverk som ikke lenger vedlikeholdes (React 16, jQuery, Bootstrap 3, Office UI
Fabric 6, klassiske sidemaler).

Vi foreslår å bygge KomInn på nytt som en moderne SPFx-løsning i Asker kommunes
Microsoft 365-leietaker. Datamodellen (listene) beholdes i hovedsak som i dag, slik at
eksisterende forslag, vurderinger og kampanjer kan flyttes over. All eksisterende kode
erstattes.

**Mål**

- Moderne, rask og universelt utformet brukeropplevelse (WCAG 2.1 AA) som fungerer på
  mobil, i Teams og i SharePoint.
- Støttet teknologi fra Microsoft uten egen serverdrift eller tilleggslisenser.
- Enklere drift: løsningen installeres som en app-pakke, og alt innhold styres av
  saksbehandlere gjennom lister og webdel-innstillinger.
- Sikrere løsning: ingen nøkler i lister, og saksbehandlerfunksjoner beskyttes av
  SharePoint-rettigheter, ikke bare av skjult brukergrensesnitt.

## 2. Funksjonalitet som videreføres

| Område | Dagens funksjon | Ny løsning |
|---|---|---|
| Forside | Månedens/promoterte forslag, populære forslag med filter og sortering, suksesshistorier, mine forslag, søk | Egne webdeler som Asker selv setter sammen på en moderne side |
| Nytt forslag | Skjema med tittel, beskrivelse, søkt sum, utfordringer, innsatsområder, tags, bærekraftsmål, bilde, sted og «inspirert av». Personalia og nærmeste leder hentes automatisk | Ett skjema i Fluent UI med validering, autolagring av utkast og «kopier forslag» |
| Visning av forslag | Innhold, bærekraftsmål, kart, «inspirert av»-graf, liker, kommentarer, «dette vil vi også gjøre» | Samme innhold, ryddigere layout; graf erstattes av en kjede/liste over relaterte forslag |
| Saksbehandling | Statusflyt, saksbehandler, vurdering med score på fire kriterier, snitt per forslag | Egen webdel for saksbehandlere med oversikt, vurdering og statusendring |
| Kampanjer | Kampanjeliste styrer tekster og perioder | Videreføres, styres fra liste og webdel-egenskaper |
| Send til KS (Induct) | Manuell eksport fra egen side | Videreføres som valgfri integrasjon via Power Automate eller Azure Function (avklares) |

## 3. Teknisk løsning i korte trekk

- **SharePoint Framework 1.22+ (Heft), React, TypeScript 5, Fluent UI v9, PnPjs v4.**
  Standard Microsoft-verktøykjede, ingen tredjeparts rammeverk.
- **Moderne SharePoint-område** (kommunikasjons- eller teamområde) med moderne sider og
  KomInn-webdeler. Webdelene kan også vises i Microsoft Teams.
- **Datamodell beholdes:** listene Forslag, Forslagsvurdering, Kampanje, Kommentarer,
  Likes, Bærekraftsmål, Ikoner, Bilder og Konfigurasjon videreføres med dagens felt.
  Mindre justeringer gjøres der det gir bedre sikkerhet eller ytelse.
- **Kart uten Google-nøkkel:** Leaflet med Kartverkets åpne karttjenester erstatter
  Google Maps. Ingen API-nøkkel, ingen kostnad, norsk kartgrunnlag.
- **Rettigheter:** saksbehandlerfunksjoner styres av SharePoint-gruppen
  «Saksbehandlere» og listerettigheter. Vanlige brukere kan opprette og redigere egne
  forslag, like og kommentere.
- **Provisjonering:** PnP PowerShell-mal oppretter felt, lister, sider, navigasjon og
  grupper. App-pakken (.sppkg) legges i Askers appkatalog.
- **Migrering:** skript flytter eksisterende forslag, vurderinger, kommentarer, likes og
  bilder fra dagens område til det nye. Dagens løsning kan stå parallelt til overgangen
  er verifisert.

## 4. Leveranser

1. Løsningsdesign og skisser (godkjennes av Asker før bygging).
2. SPFx-pakke med webdelene Forside (fire varianter), Nytt forslag, Forslag og
   Saksbehandling.
3. Provisjoneringsmal og installasjonsveiledning.
4. Migreringsskript og gjennomført migrering av eksisterende data.
5. Brukerveiledning for saksbehandlere og kort administratordokumentasjon.
6. Kildekode i Asker kommunes GitHub-organisasjon (KomInn), åpen som i dag.

## 5. Gjennomføring

| Fase | Innhold | Varighet (anslag) |
|---|---|---|
| 1. Avklaring og design | Arbeidsmøter, prioritering, skisser, avklaring av KS-integrasjon | 2–3 uker |
| 2. Grunnmur | Prosjektoppsett, datamodell, provisjonering, datalag | 2–3 uker |
| 3. Bygging | Skjema, visning, forside, saksbehandling; demo hver andre uke | 6–8 uker |
| 4. Test og migrering | Akseptansetest med Asker, UU-test, migrering i testmiljø | 2–3 uker |
| 5. Produksjonssetting | Migrering, opplæring, overgang | 1 uke |

Samlet kalendertid ca. 3–4 måneder med ett utviklingsteam (1–2 utviklere og en
løsningsansvarlig fra SoftwareOne). Detaljert estimat og pris gis etter fase 1.

## 6. Forutsetninger og avklaringer

- Asker stiller med produkteier og 2–3 saksbehandlere til arbeidsmøter og test.
- SoftwareOne får tilgang til test- og produksjonsleietaker (appkatalog, SharePoint-
  administrator ved installasjon).
- Om «Send til KS» (Induct) fortsatt skal støttes, og i så fall hvilken lisens som er
  tilgjengelig for Power Automate eller Azure.
- Om dagens område skal gjenbrukes eller om det opprettes nytt område.
- Om liker og kommentarer skal bruke SharePoints innebygde funksjoner i stedet for egne
  lister (forenkler løsningen, men bilder i kommentarer bortfaller).

## 7. Hvorfor dette gir verdi for Asker

- Løsningen bygger kun på støttet Microsoft-teknologi og lever like lenge som
  Microsoft 365.
- Brukerne får samme opplevelse som i resten av moderne SharePoint og Teams.
- Krav til universell utforming ivaretas gjennom Fluent UI og målrettet testing.
- Åpen kildekode gjør at andre kommuner fortsatt kan ta løsningen i bruk.
