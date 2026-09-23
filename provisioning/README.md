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
./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id>
```

Uten nettleser (server, container) og med opplasting av app-pakken og tilgang for alle ansatte:

```powershell
./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id> -Tenant kommune.onmicrosoft.com `
  -DeviceLogin -AppPackagePath ../sharepoint/solution/kominn.sppkg -GrantEveryone
```

Rekkefølge ved ny installasjon:

1. Last opp `kominn.sppkg` til appkatalogen og distribuer globalt.
2. Opprett et moderne område og gjør deg til områdeeier.
3. Kjør `Install.ps1`. Bruk `-SkipPages` dersom app-pakken ikke er distribuert enda, og kjør igjen uten når den er det.
4. Legg saksbehandlere i gruppen **Saksbehandlere**.

Malen kan kjøres flere ganger. Seed-data skrives ikke over (`UpdateBehavior="Skip"`).

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
