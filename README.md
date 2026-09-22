# KomInn 2.0

KomInn er en løsning for å sende inn, vurdere og synliggjøre forslag til kommunale tiltak,
opprinnelig utviklet av Asker kommune. Versjon 2.0 er bygget på nytt som en moderne
SharePoint Framework-løsning (SPFx) for Microsoft 365, og erstatter den klassiske
løsningen fra 1.x i sin helhet.

Løsningen er åpen kildekode og kan tas i bruk av andre kommuner og organisasjoner.

## Funksjonalitet

| Webdel | Beskrivelse |
|---|---|
| **Forslagsliste** | Viser forslag som kort. Modus velges i egenskapsruten: promoterte, publiserte, suksesshistorier, mine forslag eller månedens forslag. Kan peke på et annet område, slik at intranettet kan liste godkjente forslag fra KomInn-området. |
| **Søk i forslag** | Søkefelt som finner forslag på tittel og går til forslagssiden. |
| **Nytt forslag** | Skjema for å sende inn forslag: tittel, beskrivelse, søkt sum, utfordringer, innsatsområder, bærekraftsmål, bilde, sted og «inspirert av». Personalia og nærmeste leder hentes fra brukerprofilen. |
| **Forslag** | Viser ett forslag med innhold, bærekraftsmål, kart, relaterte forslag, liker og kommentarer. Saksbehandlere ser vurderingspanelet. |
| **Saksbehandling** | Oversikt for saksbehandlere med status, tildeling og snitt av vurderinger. |

Datamodellen (listene Forslag, Forslagsvurdering, Kampanje, Kommentarer, Likes,
Bærekraftsmål, Ikoner, Bilder og Konfigurasjon) bygger på 1.x og provisjoneres med
PnP-malen i `provisioning/`.

## Teknologi

- SharePoint Framework 1.23 med Heft-toolchain
- React 17, TypeScript 5, Fluent UI
- PnPjs for all datatilgang mot SharePoint
- Leaflet med Kartverkets karttjenester for kart (ingen API-nøkkel)
- PnP.PowerShell 3.4 for provisjonering

## Struktur

```
config/          SPFx-konfigurasjon (package-solution.json m.m.)
docs/            Løsningsforslag og intern byggeplan
provisioning/    PnP-mal, Install.ps1 og ikoner for bærekraftsmål
src/shared/      Felles modeller, datalag, hooks og komponenter
src/webparts/    Én mappe per webdel
teams/           Ikoner for Teams-manifest
```

## Kom i gang

Krever Node 22 (se `.nvmrc`).

```bash
npm install
npm run serve      # lokal workbench mot https://<tenant>.sharepoint.com/_layouts/workbench.aspx
npm run lint
npm run test
npm run package    # produksjonsbygg, gir sharepoint/solution/kominn.sppkg
```

Sett `initialPage` i `config/serve.json` til workbench på ditt eget testområde før du
kjører `npm run serve`. Legg til `?kominnMock=1` i adressen for å kjøre webdelene mot
testdata i minnet, uten lister på området.

## Installasjon

1. Last opp `kominn.sppkg` til appkatalogen i leietakeren og godkjenn distribusjon.
2. Opprett et moderne SharePoint-område (kommunikasjons- eller teamområde).
3. Kjør `provisioning/Install.ps1` mot området med PnP.PowerShell 3.4 eller nyere.
   Skriptet kjører `provisioning/template.xml`, som oppretter felt, innholdstyper, lister,
   gruppen Saksbehandlere, sider med webdeler og navigasjon. Se `provisioning/README.md`.
4. Legg saksbehandlere i SharePoint-gruppen **Saksbehandlere**.

Versjon 2.0 er en nyinstallasjon. Data fra 1.x flyttes ikke.

## Versjon 1.x

Den klassiske løsningen (React 16, jQuery, klassiske sider og PnP provisioning template)
finnes i git-historikken under taggen [`v1-final`](https://github.com/KomInn/kominn/tree/v1-final).
Den vedlikeholdes ikke.

## Bidra

Åpne gjerne issues og pull requests. Kodestandard håndheves med ESLint
(`npm run lint`), og alle pull requests bygges av GitHub Actions.

## Kontakt

Løsningen utvikles av SoftwareOne på vegne av Asker kommune. Spørsmål om å ta løsningen i
bruk kan rettes til Tarjei Ormestøyl, SoftwareOne.
