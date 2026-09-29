# Provisjonering

Alt som trengs for å sette opp et KomInn-område.

| Fil | Innhold |
|---|---|
| `template.xml` | PnP Provisioning-mal på skjema 2022/09: felt, innholdstyper, lister med visninger, gruppen Saksbehandlere, rettigheter på Forslagsvurdering, moderne sider med KomInn-webdelene, navigasjon og seed-data (bærekraftsmål, standardtekst, kartkonfigurasjon). |
| `Install.ps1` | Kobler til området og kjører malen. Krever PnP.PowerShell 3.4 eller nyere. |
| `assets/icons/` | Ikoner for FNs 17 bærekraftsmål. Lastes opp til biblioteket Ikoner. |

## Kjøring

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser
./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id> -GrantEveryone
```

Skriptet bygger SPFx-løsningen, laster opp og publiserer `kominn.sppkg` i appkatalogen, installerer den på området, kjører
malen og gir alle ansatte medlemstilgang. Innlogging skjer i nettleservindu (`-Interactive`).

| Parameter | Virkning |
|---|---|
| `-AppScope Site` | Bruk områdets egen appkatalog i stedet for leietakerens |
| `-SkipBuild` | Bruk eksisterende `sharepoint/solution/kominn.sppkg` |
| `-SkipApp` | Ikke last opp app-pakken |
| `-SkipPages` | Hopp over sidene med webdeler |
| `-GrantEveryone` | Legg «Alle unntatt eksterne brukere» i medlemsgruppen |

Krever Node.js 22 for byggetrinnet, eierrettighet på området og tilgang til appkatalogen.
Legg saksbehandlere i gruppen **Saksbehandlere** etterpå. Malen kan kjøres flere ganger; seed-data
skrives ikke over (`UpdateBehavior="Skip"`).

## Demodata

`Seed-DemoData.ps1` fyller området med åtte demoforslag i alle statuser (sendt inn, publisert,
promotert, suksess og gjort tidligere), med bærekraftsmål, sted, «inspirert av», kommentarer og
vurderinger. Ett av forslagene er månedens forslag.

```powershell
./Seed-DemoData.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id>
./Seed-DemoData.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id> -Remove
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
