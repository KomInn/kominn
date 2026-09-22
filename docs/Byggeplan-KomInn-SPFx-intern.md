# KomInn 2.0 på SPFx – intern byggeplan

**Intern arbeidsdokumentasjon for SoftwareOne. Deles ikke med kunde uten bearbeiding.**
Versjon 0.9 · September 2026

Grunnlag: gjennomgang av dagens kildekode (`src/`), PnP-malen (`templates/root`) og
installasjonsskriptet i KomInn-repoet, versjon 1.1.2 (siste commit «Tweaks after
meeting», klimatilskudd-grenen).

Rammer fra produktledelse: alt leveres i ett løp som versjon 2.0. Asker vet at dette er
en prototype og aksepterer barnesykdommer. All v1-kode ryddes ut av repoet. PnP-skript
og maler skal bruke PnP.PowerShell 3.4 og siste PnP Provisioning Schema.

---

## 1. Dagens løsning – funn fra kodegjennomgang

### 1.1 Arkitektur

- Klassiske .aspx-sider i `SitePages/` med en `<div id="...">` per side. Én webpack-
  bundle (`SiteAssets/js/bundle.js`) renderer React-komponent ut fra hvilken div som
  finnes: `frontpageTop`, `frontpage`, `newsuggestion`, `viewsuggestion`, `vurdering`,
  `sendtilks`.
- Stack: TypeScript 2.7, React 16, webpack 4, jQuery 3, JSOM (`SP.ClientContext`),
  REST med `odata=verbose`, Bootstrap 3, react-bootstrap, office-ui-fabric-react 6,
  react-google-maps, vis.js (nettverksgraf), react-slick, moment.
- Datalag: `DataAdapter` (proxy) → `SPDataAdapter` (statiske metoder). Rotete blanding
  av JSOM, jQuery-ajax og REST. Mange `componentWillMount`.
- Provisjonering: PnP provisioning template (`root.pnp`) + `Install.ps1` med
  `Connect-PnPOnline -UseWebLogin` og `Apply-PnPProvisioningTemplate` (legacy PnP
  PowerShell, fungerer ikke på PnP.PowerShell 2.x uten endringer).

### 1.2 Datamodell (beholdes i hovedsak)

Alle felt ligger i gruppen «KomInn» med prefiks `Kmi`. Innholdstyper: **Forslag**
(`0x0100 63D756B6…`), **Forslagsvurdering** (`0x0100 65441382…`), **Kampanje**
(`0x0100 5A1A9137…`).

| Liste | URL | Type | Nøkkelfelt |
|---|---|---|---|
| Forslag | `/Forslag` | Generisk liste, CT Forslag | Title, KmiSummary, KmiChallenges, KmiSuggestedSolution, KmiAmount, KmiApplyingFor, KmiUsefulnessType (multichoice innsatsområder), KmiTags, KmiUsefulForOthers, KmiImage (url), KmiLocation («lat,lng»), KmiStatus, KmiCaseWorkerStatus, KmiCaseWorker (user), KmiMonthlyStartDate/EndDate, KmiIsPast, KmiCompRef, KmiLikes, KmiNumberOfComments, personalia (KmiName, KmiAddress, KmiZipcode, KmiCity, KmiCountyCode, KmiMailAddress, KmiTelephone, KmiDepartment, KmiManager), lookup-multi KmiSustainabilityGoals → Baerekraftsmaal, lookup-multi «Inspirert av» → Forslag |
| Forslagsvurdering | `/Lists/Forslagsvurdering` | CT Forslagsvurdering, versjonering | Lookup Forslag, KmiScoreFeasability, KmiScoreUserInvolvement (vises som «utslippsreduksjon»), KmiScoreDistributionPotential, KmiScoreDegreeOfInnovation, KmiMoreActors, KmiLawRequirements, KmiShortComment |
| Kampanje | `/Lists/Kampanje` | CT Kampanje | KmiCampaignType (Standard/Kampanje/Fortid), KmiCampaignText, Start/EndDate, KmiCampaignRef, KmiCampaignPlacement |
| Kommentarer | `/Kommentarer` | Generisk | Text, Image, SuggestionId (Number, ikke lookup) |
| Likes | `/Likes` | Generisk | Forslag (Number, ikke lookup); én rad per bruker per forslag |
| Baerekraftsmaal | `/Lists/Baerekraftsmaal` | Generisk, 17 rader seedes | Title, lookup Ikon → Ikoner |
| Ikoner | `/Ikoner` | Dokumentbibliotek | 17 PNG (Goal-01..17) |
| Bilder | `/Bilder` | Bildebibliotek (109) | Opplastede bilder til forslag |
| Konfigurasjon | `/Lists/Konfigurasjon` | Nøkkel/verdi | KmiKey, KmiValue (i dag: GOOGLE_MAPS_API_KEY) |
| Kommunenumre | (ikke i malen!) | | Postnummer → Kommunenummer, Sted. Brukes av `getCityAndCountryCode` |

Statusverdier: `KmiStatus` = Sendt inn / Publisert / Suksess / Promotert.
`KmiCaseWorkerStatus` = Sendt inn / Løftes til linja / Vurderes / Godtatt / Avslått.
Enum `Status` i koden har også `Draft` som ikke finnes i listen.

Sikkerhet: én SharePoint-gruppe **Saksbehandlere**. Listene har ingen egne rettigheter;
alt styres av standard områdegrupper.

### 1.3 Funksjonalitet per side

**Home.aspx** – `FrontpageTop` (søkefelt mot Forslag på tittel) + `Frontpage`:
`PromotedSuggestions` (Status = Promotert, karusell), «månedens forslag» (filter på
Monthly-datoer, `InnovationOfTheMonth`), `PopularSuggestions` (Status = Publisert, filter
på KmiUsefulnessType og KmiTags hentet dynamisk fra feltvalg, sortering på likes /
kommentarer / dato, paging med «vis flere», hardkodet tittel «Har søkt internt
klimatilskudd 2022» og årsfilter), `SuccessStories` (Status = Suksess), `MySuggestions`.

**NyttForslag.aspx** – `CommonFields` (tittel, beskrivelse, søkt sum, utfordringer,
innsatsområder; løsning/nyttig for andre er kommentert ut), `Personalia` (fylles fra
brukerprofil: navn, e-post, avdeling, telefon, adresse, postnummer; nærmeste leder fra
profilegenskapen Manager; kommunenummer fra Kommunenumre-listen), `SustainabilityGoals`
(velg blant 17), `UploadImages` (til Bilder), `AddLocation` (Google Maps-klikk gir
lat,lng), `InspiredBy` (velg forslag). Query `?kopier=<id>` forhåndsutfyller fra et
eksisterende forslag og setter «Inspirert av».

**Forslag.aspx?forslag=<id>** – `Content`, `Summary`, `InspiredBy` (vis.js-graf av kjede
+ Google-kart med pins og linjer), `Actions` (Like, «Dette vil vi også gjøre» → modal →
kopier), `SuggestionRating` (Fluent Slider 4 kriterier + flere aktører + kommentar,
skriver til Forslagsvurdering; vises kun for saksbehandlere), `Details` (personalia,
status, tags), `MapView` (Google embed), `Comments` (liste + nytt innlegg, teller
oppdateres på Forslag).

**Vurdering.aspx** – `Vurdering`: DetailsList med snitt per forslag. NB: leser feltnavn
uten `Kmi`-prefiks (`ScoreFeasability` osv.) – trolig ødelagt etter omdøping av felt.

### 1.4 Svakheter vi løser i ny versjon

Ny løsning er en nyinstallasjon på nytt område. Ingen data flyttes fra dagens løsning.

1. Google Maps API-nøkkel ligger i klartekst i malen og i repoet. Må roteres/slettes hos
   Asker uansett.
2. Likes- og kommentarteller på Forslag oppdateres fra klienten → krever skrive-
   rettighet på alle forslag for alle brukere, og gir race conditions.
3. Saksbehandlerfunksjoner beskyttes kun av UI-sjekk (`doesUserHavePermission`).
4. Likes/Kommentarer bruker Number-felt i stedet for lookup → ingen referanseintegritet,
   dyre spørringer.
5. Hardkodede tekster og år («2022») i kode i stedet for konfigurasjon.
6. Listen Kommunenumre mangler i malen; funksjonen feiler stille.
7. Utdaterte avhengigheter med kjente sårbarheter.

## 2. Målarkitektur

### 2.1 Stack

| Lag | Valg | Kommentar |
|---|---|---|
| Rammeverk | SPFx 1.22+ (Heft-toolchain), Node 22 LTS | Bruk `m365 spfx doctor` for å låse versjoner ved oppstart |
| UI | React (versjon som følger SPFx-generatoren), TypeScript 5, Fluent UI v9 (`@fluentui/react-components`, `@fluentui/react-icons`) | Ikke Fabric/Fluent v8. FluentProvider med tema fra host |
| Data | PnPjs v4 (`@pnp/sp`, ev. `@pnp/graph`) | Ett `DataService` som eneste inngang mot SharePoint. Ingen jQuery, ingen JSOM |
| Tilstand | React hooks + en lett store (Zustand eller React Context) | Unngå Redux-tyngde |
| Kart | Leaflet + `react-leaflet`, Kartverkets WMTS/cache (`cache.kartverket.no`) | Ingen nøkkel. Alternativ: Azure Maps (krever nøkkel og abonnement) |
| Bygg/CI | GitHub Actions: lint, test, `heft build --production`, `heft package-solution --production`, opplasting av .sppkg som release-artefakt | Ev. auto-deploy til test-appkatalog med CLI for Microsoft 365 |
| Provisjonering | PnP.PowerShell 3.4, `Invoke-PnPSiteTemplate`, mal i XML på siste PnP Provisioning Schema (ikke .pnp-binær i repo) | Skrives på nytt. Dagens `templates/root` brukes kun som fasit for felt og lister |
| Test | Jest + React Testing Library for komponenter og `DataService`-mapping; Playwright for røyktest mot testområde | |

### 2.2 Webdeler

| Webdel | Innhold | Egenskaper (property pane) |
|---|---|---|
| **KomInn – Forslagsliste** | Én fleksibel listewebdel som erstatter Promoted, Popular, Success, MySuggestions og Månedens forslag | Modus (Promoterte / Publiserte / Suksess / Mine / Månedens), tittel, tom-tekst, antall, filterpanel av/på, sortering, datoperiode (fra/til, eller «inneværende år»), layout (kort/karusell/kompakt) |
| **KomInn – Søk** | Søkefelt med forslag-typeahead, navigerer til forslagssiden | Plassholdertekst, målside |
| **KomInn – Nytt forslag** | Hele skjemaet, støtte for `?kopier=<id>`, utkast lagres i localStorage | Hvilke seksjoner som vises (sted, bilde, bærekraftsmål, inspirert av), hjelpetekster, målside etter innsending |
| **KomInn – Forslag** | Detaljvisning, id fra `?forslag=<id>`, liker, kommentarer, kart, relaterte forslag, saksbehandlerpanel (kun for gruppen) | Vis kart av/på, vis vurdering av/på |
| **KomInn – Saksbehandling** | Oversikt over alle forslag med KmiCaseWorkerStatus, tildeling av saksbehandler, endring av status, snitt av vurderinger (erstatter Vurdering.aspx) | Kolonnevalg, standardfilter |

Konfigurasjon (tekster, aktiv kampanje, innsatsområder) leses fra listene Kampanje og
Konfigurasjon, ikke fra kode.

### 2.3 Sider på området

- **Hjem**: Søk, Forslagsliste (Månedens), Forslagsliste (Publiserte m/filter),
  Forslagsliste (Suksess), Forslagsliste (Mine) i tokolonne-layout.
- **Nytt forslag**: én webdel.
- **Forslag**: én webdel (siden brukes med query string).
- **Saksbehandling**: én webdel, siden er kun synlig for gruppen Saksbehandlere
  (sidebibliotek-rettighet eller egen underside).

### 2.4 Datamodell – justeringer

Videreføres med dagens felt: Forslag, Forslagsvurdering, Kampanje, Baerekraftsmaal,
Ikoner, Bilder, Konfigurasjon. Foreslåtte endringer (avklares med Asker
i oppstartsmøtet):

1. **Likes og Kommentarer**: anbefalt → bruk SharePoints innebygde Likes (Rating
   settings = Likes på Forslag) og innebygde listeelement-kommentarer via PnPjs
   `@pnp/sp/comments`. Fjerner to lister, telleroppdatering og skrivebehov på Forslag.
   Ulempe: ingen bilder i kommentarer. Fallback: behold listene, men gjør `Forslag`-feltet til Lookup og la
   tellere beregnes av en Power Automate-flyt.
2. **Kommunenumre**: legg listen inn i malen med seed-data (Posten/Kartverket) eller
   slipp kommunenummer helt. Asker er én kommune; feltet er trolig arv fra
   flerkommune-ambisjonen.
3. **Konfigurasjon**: fjern GOOGLE_MAPS_API_KEY. Bruk til tekster/etiketter.
4. **Status**: fjern `Draft` fra kode eller legg til «Utkast» i listen dersom Asker vil ha
   ekte utkast.
5. Rettigheter: Forslag = Contribute for alle med `WriteSecurity=2` (kun egne elementer),
   Saksbehandlere = Edit. Forslagsvurdering = kun Saksbehandlere. Bilder = Contribute.

### 2.5 Personalia og leder

Primært `sp.profiles.myProperties` via PnPjs (samme kilde som i dag, ingen ekstra
API-tilgang). Sekundært Graph (`/me`, `/me/manager`) dersom Asker vil ha ferskere data;
krever godkjenning av `User.Read`/`User.ReadBasic.All` i API-tilgang.

## 3. Arbeidspakker og grovestimat

Timer er grovestimat for gjennomføring, inkl. enhetstest og kodegjennomgang. Ikke QA-
sikret. Testomfanget er satt til prototypenivå.

| # | Arbeidspakke | Innhold | Timer |
|---|---|---|---|
| WP0 | Oppstart | Ett arbeidsmøte med Asker, beslutning på 2.4, enkle skisser, backlog | 15–20 |
| WP1 | Prosjektoppsett og opprydding | Tagg `v1-final` og slett all v1-kode (`src/`, `templates/`, `build/`, `scripts/`, webpack, gamle avhengigheter). Yeoman-scaffold (`--framework react`) på rot, versjon 2.0.0, ESLint/Prettier, Jest, GitHub Actions, README, mock-datalag for lokal utvikling | 30–40 |
| WP2 | Datamodell og provisjonering | Ny PnP-mal på siste PnP Provisioning Schema (felt, CT, lister, seed for bærekraftsmål/ikoner, grupper, moderne sider med webdeler, navigasjon), `Install.ps1` for PnP.PowerShell 3.4, testområde | 40–50 |
| WP3 | Datalag | `DataService` med PnPjs: forslag (CRUD, filter, sortering, paging), vurderinger, kampanjer, bærekraftsmål, kommentarer/likes, bildeopplasting, profil, rettighetssjekk, konfig. Modeller og mapping med tester | 50–60 |
| WP4 | Webdel Nytt forslag | Skjema, validering, personalia, bærekraftsmål, bilde (drag/drop, komprimering), sted (Leaflet), inspirert av (velger), kopier-modus, utkast | 70–90 |
| WP5 | Webdel Forslag | Layout, innhold, bærekraftsmål-ikoner, kart, relaterte forslag (kjede), like, kommentarer, «dette vil vi også gjøre», saksbehandlerpanel med vurdering | 70–90 |
| WP6 | Webdel Forslagsliste + Søk | Kortkomponent, moduser, filterpanel (dynamiske valg fra felt), sortering, paging, karusell, property pane, søk med typeahead | 70–90 |
| WP7 | Webdel Saksbehandling | Tabell med filter/sortering, statusendring, tildeling, snittvurderinger | 40–60 |
| WP8 | Lansering | Røyktest av hovedflytene, enkel UU-sjekk (tastatur, kontrast), kort brukerveiledning og admin-doc, installasjon i produksjon, opplæring | 20–30 |
| | **Sum** | | **405–530** |

Bemanning: 1 senior SPFx-utvikler (hoved), 1 utvikler (deltid), 1 løsningsansvarlig/PL
(ca. 10 %). Kalendertid 2,5–3 måneder.

## 4. Gjennomføring i ett løp

Ingen sprinter, demoer eller godkjenningspunkter underveis. Rekkefølgen er styrt av
avhengigheter:

1. WP0 og WP1 første uke. Beslutning om likes/kommentarer tas i oppstartsmøtet.
2. WP2 og WP3 parallelt: provisjonering og datalag mot samme testområde.
3. WP4 og WP6 parallelt (skjema og liste), deretter WP5 og WP7.
4. WP8 siste uke. Asker har lesetilgang til testområdet hele veien og kan prøve
   fortløpende, uten at det utløser formelle tilbakemeldingsrunder.

Feil som oppdages etter lansering håndteres som vedlikehold på versjon 2.x.

## 5. Tekniske retningslinjer for teamet

- Én webdel-pakke (én .sppkg) med flere webdeler; felles kode i `src/shared`
  (modeller, `DataService`, hooks, komponenter).
- Webdeler skal fungere uten konfig (fornuftige standardverdier) og vise tydelig
  feilmelding når lister mangler.
- All tekst i `loc/nb-no.js` (+ `en-us` som fallback). Ingen hardkodede norske strenger i
  komponenter.
- Fluent UI v9 komponenter først; ingen egenbygde knapper/felt. `FluentProvider` med
  tema fra `context.sdks.microsoftTeams`/SharePoint-tema.
- Tilgjengelighet: alle interaktive elementer nåbare med tastatur, `aria-label` på
  ikonknapper, fokusstyring i dialoger, kontrast fra tema. Kjør axe i Playwright.
- Bilder: komprimer i klient før opplasting (maks 1600 px), lagre i Bilder med
  referanse-URL på forslaget. Vurder thumbnails via `_layouts/15/getpreview.ashx`.
- Rettighetsavhengig UI **og** listerettigheter. Aldri stol på UI alene.
- Ingen hemmeligheter i lister, kode eller property pane.
- Mock-`DataService` (in-memory JSON) slik at webdeler kan kjøres i workbench uten
  SharePoint-lister.

## 6. Åpne spørsmål til oppstartsmøtet

1. Beholde egne lister for likes/kommentarer eller innebygd funksjon?
2. Når skal dagens løsning tas ned? Skal den stå i lesemodus en periode etter lansering?
3. Skal kommunenummer/postnummer-oppslag videreføres?
4. Skal anonyme forslag støttes?
5. Skal løsningen også eksponeres i Teams (personlig app / tab)?
6. Hvilke innsatsområder og tags gjelder nå? (Dagens verdier er klimaplan-spesifikke.)
