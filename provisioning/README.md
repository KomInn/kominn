# Provisjonering

Alt som trengs for å sette opp et KomInn-område.

| Fil | Innhold |
|---|---|
| `template.xml` | PnP Provisioning-mal på skjema 2022/09: felt, innholdstyper, lister med visninger, gruppene Saksbehandlere og Idéinnspillere med rettigheter, moderne sider med KomInn-webdelene, navigasjon og seed-data (bærekraftsmål, standardtekst, kartkonfigurasjon). |
| `Install.ps1` | Kobler til området og kjører malen. Krever PnP.PowerShell 3.4 eller nyere. |
| `assets/icons/` | Ikoner for FNs 17 bærekraftsmål. Lastes opp til biblioteket Ikoner. |
| `assets/logo/` | KomInn-logoen (SVG-kilde og PNG). PNG-en lastes opp til Ikoner og settes som områdelogo. |
| `assets/images/` | `kominn-standardbilde.jpg` vises på forslagskort uten eget bilde. Lastes opp til Ikoner, og kan byttes ut der med en fil med samme navn. Kilden ligger i `docs/kominn-illustrasjon.jpg`. |

## Kjøring

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser
./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ContributorGroup alle-ansatte@kommune.no
```

Skriptet bygger SPFx-løsningen, laster opp og publiserer `kominn.sppkg` i appkatalogen, installerer den på området, kjører
malen og legger eventuelt kommunens Entra-grupper inn i KomInn-gruppene. Innlogging skjer i nettleservindu (`-Interactive`). `-ClientId` er som standard
Prosjektportalens multi-tenant-app for interaktiv PnP-innlogging (`da6c31a6-b557-4ac3-9994-7315da06ea3a`), som fungerer i
de fleste tenanter der den er godkjent. Oppgi `-ClientId <app-id>` for å bruke en annen appregistrering.

| Parameter | Virkning |
|---|---|
| `-AppScope Site` | Bruk områdets egen appkatalog i stedet for leietakerens |
| `-SkipBuild` | Bruk eksisterende `sharepoint/solution/kominn.sppkg` |
| `-SkipApp` | Ikke last opp app-pakken |
| `-SkipPages` | Hopp over sidene med webdeler |
| `-ContributorGroup <gruppe>` | Legg en Entra-gruppe, typisk alle ansatte, i **Idéinnspillere** |
| `-CaseWorkerGroup <gruppe>` | Legg en Entra-gruppe i **Saksbehandlere** |

Entra-grupper oppgis med objekt-ID (sikkerhetsgruppe), e-postadresse (e-postaktivert gruppe eller
Microsoft 365-gruppe) eller fullstendig påloggingsnavn. Uten parameterne fylles gruppene i SharePoint etterpå.

Krever Node.js 22 for byggetrinnet, eierrettighet på området og tilgang til appkatalogen.
Malen kan kjøres flere ganger; seed-data skrives ikke over (`UpdateBehavior="Skip"`).

## Rettigheter

Malen oppretter to SharePoint-grupper og setter rettighetene. Kommunen legger sine Entra-grupper inn i dem.

| | Idéinnspillere | Saksbehandlere | Besøkende | Eiere |
|---|---|---|---|---|
| Området og sidene | Lese | Redigere | Lese | Full kontroll |
| Forslag | Bidra, bare egne elementer | Redigere alle | Lese | Full kontroll |
| Kommentarer og Likes | Bidra, bare egne elementer | Redigere alle | Lese | Full kontroll |
| Bilder | Bidra | Redigere | Lese | Full kontroll |
| Forslagsvurdering | Ingen tilgang | Bidra | Ingen tilgang | Full kontroll |

Idéinnspillere ser alle forslag og kommentarer, men kan bare endre og slette sine egne. Listene Forslag,
Kommentarer og Likes har «Opprette elementer og redigere elementer de har opprettet» (`WriteSecurity="2"`).
Saksbehandlere har Redigere, som overstyrer dette. Antall likes og kommentarer telles fra listene Likes og
Kommentarer, så ingen trenger å skrive i andres forslag.

Medlemmer brukes ikke av KomInn og beholder sin vanlige betydning. Eldre versjoner av skriptet la
«Alle unntatt eksterne brukere» i Medlemmer (`-GrantEveryone`). Skriptet fjerner dem derfra.

## Demodata

`Seed-DemoData.ps1` fyller området med åtte demoforslag i alle statuser (sendt inn, publisert,
promotert, suksess og gjort tidligere), med bærekraftsmål, sted, «inspirert av», kommentarer og
vurderinger. Ett av forslagene er månedens forslag.

```powershell
./Seed-DemoData.ps1 -Url https://kommune.sharepoint.com/sites/kominn
./Seed-DemoData.ps1 -Url https://kommune.sharepoint.com/sites/kominn -Remove
```

Demoforslagene merkes med konkurransereferansen `DEMO`, og skriptet kan kjøres flere ganger.
`-Remove` sletter dem, og tilhørende kommentarer, likes og vurderinger slettes automatisk.
Kommentarer og vurderinger opprettes i navnet til den som kjører skriptet.

## Datamodell

| Liste | Innhold | Nøkkelfelt |
|---|---|---|
| Forslag | Innsendte forslag, innholdstype Forslag | Title, KmiSummary, KmiAmount, KmiUsefulnessType, KmiTags, KmiStatus, KmiCaseWorkerStatus, KmiCaseWorker, personalia (KmiName …), KmiSustainabilityGoals (lookup), KmiInspiredBy (lookup til Forslag), KmiLikes, KmiNumberOfComments |
| Forslagsvurdering | Én vurdering per saksbehandler per forslag. Kun Saksbehandlere og eiere har tilgang | KmiSuggestion (lookup), KmiScore* (1–5), KmiMoreActors, KmiLawRequirements, KmiShortComment |
| Kommentarer | Kommentarer til forslag. Brukere kan bare endre egne | KmiSuggestion (lookup), KmiText, KmiImage |
| Likes | Én rad per bruker per forslag. Brukere kan bare endre egne | KmiSuggestion (lookup) |
| Kampanje | Tekster og perioder for forsiden | KmiCampaignType, KmiCampaignText, start/slutt, KmiCampaignPlacement |
| Baerekraftsmaal | FNs 17 mål, seedes | Title, KmiIconFileName |
| Ikoner | Bibliotek med ikonene | |
| Bilder | Bildebibliotek for opplastede bilder | |
| Konfigurasjon | Nøkkel/verdi | KmiKey, KmiValue (KART_SENTER, KART_ZOOM) |

Endringer fra 1.x: koblingene fra Kommentarer og Likes til Forslag er lookup-felt (var tall),
Bærekraftsmål peker på ikonfil med tekstfelt (var lookup til Ikoner), Kommunenumre og
InductKonfigurasjon er tatt ut, og listene ligger under `Lists/`. Den gamle malen finnes under
taggen `v1-final`.
