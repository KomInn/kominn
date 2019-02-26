# KomInn - Forslagsløsning for kommunale tiltak

## Kort funksjonell beskrivelse
KomInn er en løsning for å sende, motta og behandle forslag.

## Teknisk beskrivelse
Løsningen er utviklet med view-rammeverket React og skrevet i TypeScript. 

Løsningen er initielt konstruert for SharePoint, men er designet for også å kunne kobles på andre datakilder.

Se forøvrig utviklerdokumentasjon sammen med kildefilene. 


## Installasjon
Løsningen kan rulles ut både til SharePoint Online i Classic mode og SharePoint On-premise (2013 testet). Følg installasjonsveiledningen under.  

### Installasjon på SharePoint
1. Opprett en site collection av typen Team Site i Classic mode. 
2. Deployment-brukeren må være site collection administrator.
3. Sett brukeren du skal provisjonere ut løsningen med som administrator for termlageret. 
4. Hvis du ønsker å bruke Google Maps når du skal legge inn forslag, må du redigere `.\src\Components\Common\Suggestion.ts` og legge inn en app-key der på linje `81`. 
5. Rediger `\dist\Install.ps1` så innstillingene matcher din tenant. 
6. Eksekver `\dist\Install.ps1` og velg fra menyen, begynn med valg nr. 1. 

### Viktig informasjon for SharePoint Online, før du installerer:
For å installere løsningen på SharePoint Online, må du sette `DenyAddAndCustomizePages` til `false`, slik at du får lastet opp sidene. 
Dette gjør du på følgende måte:
1. Koble til Powershell med [SharePoint Online Management Shell](https://www.microsoft.com/en-gb/download/details.aspx?id=35588)
2. Koble til SharePoint Online med: `Connect-SPOService`, du skal koble til din admin-site, det vil si at dersom du har tenanten `https://contoso.sharepoint.com`, skal du koble til `https://contoso-admin.sharepoint.com`
3. Kjør kommandoen: `Set-SPOSite -Identity https://contoso.sharepoint.com -DenyAddAndCustomizePages $false`

 



