# Provisjonering

Her ligger alt som trengs for å sette opp et KomInn-område: PnP-mal, installasjonsskript og
innhold som seedes (bærekraftsmål med ikoner).

- `Install.ps1` – kobler til området og kjører malen. Krever **PnP.PowerShell 3.4** eller nyere.
- `template.xml` – PnP Provisioning-mal på siste skjemaversjon (kommer). Felt, innholdstyper,
  lister, grupper, moderne sider med KomInn-webdeler og navigasjon.
- `assets/icons/` – ikoner for FNs 17 bærekraftsmål, lastes opp til biblioteket Ikoner.

Malen og skriptet skrives på nytt for versjon 2.0. Den gamle malen fra 1.x finnes i git-historikken
under taggen `v1-final` (`templates/root/Objects/`) og brukes kun som fasit for felt og lister.
