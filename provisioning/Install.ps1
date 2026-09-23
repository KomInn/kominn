<#
.SYNOPSIS
    Installerer KomInn 2.0 på et eksisterende, moderne SharePoint-område.

.DESCRIPTION
    Kjører PnP-malen template.xml mot området. Malen oppretter felt, innholdstyper, lister,
    gruppen Saksbehandlere, sider med KomInn-webdelene og navigasjon, og laster opp ikonene
    for bærekraftsmålene. Skriptet kan også laste opp app-pakken og gi alle ansatte
    medlemstilgang på området.

    Krav:
      - PnP.PowerShell 3.4 eller nyere (Install-Module PnP.PowerShell -Scope CurrentUser)
      - En Entra ID-appregistrering for PnP.PowerShell (Register-PnPEntraIDAppForInteractiveLogin)
      - Områdeeier på målområdet. For -AppPackagePath med -AppScope Tenant: tilgang til appkatalogen.

.PARAMETER Url
    Områdets adresse, f.eks. https://kommune.sharepoint.com/sites/kominn

.PARAMETER ClientId
    Klient-ID for appregistreringen PnP.PowerShell logger på med.

.PARAMETER Tenant
    Leietaker, f.eks. kommune.onmicrosoft.com. Påkrevd ved -DeviceLogin.

.PARAMETER DeviceLogin
    Logg på med enhetskode i stedet for nettleservindu. Nyttig på servere og i containere.

.PARAMETER AppPackagePath
    Sti til kominn.sppkg. Når den er satt, lastes pakken opp og publiseres før malen kjøres.

.PARAMETER AppScope
    Tenant (standard) for leietakerens appkatalog, eller Site for områdets egen appkatalog.

.PARAMETER GrantEveryone
    Legger «Alle unntatt eksterne brukere» i medlemsgruppen, slik at alle ansatte kan sende inn,
    like og kommentere.

.PARAMETER SkipPages
    Hopp over sidene. Brukes når app-pakken ikke er distribuert enda; sidene kan legges på senere.

.EXAMPLE
    ./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id>

.EXAMPLE
    ./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id> -Tenant kommune.onmicrosoft.com `
        -DeviceLogin -AppPackagePath ../sharepoint/solution/kominn.sppkg -GrantEveryone
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Url,
    [Parameter(Mandatory = $true)] [string] $ClientId,
    [Parameter(Mandatory = $false)] [string] $Tenant,
    [Parameter(Mandatory = $false)] [switch] $DeviceLogin,
    [Parameter(Mandatory = $false)] [string] $TemplatePath = (Join-Path $PSScriptRoot 'template.xml'),
    [Parameter(Mandatory = $false)] [string] $AppPackagePath,
    [Parameter(Mandatory = $false)] [ValidateSet('Tenant', 'Site')] [string] $AppScope = 'Tenant',
    [Parameter(Mandatory = $false)] [switch] $GrantEveryone,
    [Parameter(Mandatory = $false)] [switch] $SkipPages
)

#Requires -Modules @{ ModuleName = 'PnP.PowerShell'; ModuleVersion = '3.4.0' }
$ErrorActionPreference = 'Stop'

if (-not (Test-Path $TemplatePath)) { throw "Finner ikke malen '$TemplatePath'." }
if ($AppPackagePath -and -not (Test-Path $AppPackagePath)) { throw "Finner ikke app-pakken '$AppPackagePath'. Kjør 'npm run package' først." }
if ($DeviceLogin -and -not $Tenant) { throw '-Tenant må angis sammen med -DeviceLogin.' }

Write-Host ''
Write-Host 'KomInn 2.0' -ForegroundColor Green
Write-Host "Område:  $Url"
Write-Host "Mal:     $TemplatePath"
Write-Host ''

$connectParams = @{ Url = $Url; ClientId = $ClientId }
if ($Tenant) { $connectParams.Tenant = $Tenant }
if ($DeviceLogin) { $connectParams.DeviceLogin = $true; $connectParams.PersistLogin = $true } else { $connectParams.Interactive = $true }
Connect-PnPOnline @connectParams

$web = Get-PnPWeb
Write-Host "Koblet til '$($web.Title)'." -ForegroundColor Green

if ($AppPackagePath) {
    Write-Host "Laster opp app-pakken til appkatalogen ($AppScope) ..." -ForegroundColor Green
    $app = Add-PnPApp -Path $AppPackagePath -Scope $AppScope -Publish -SkipFeatureDeployment -Overwrite
    Write-Host "Publisert: $($app.Title) $($app.AppCatalogVersion)"
    if ($AppScope -eq 'Site') {
        $installed = Get-PnPApp -Identity $app.Id -Scope Site
        if (-not $installed.InstalledVersion) { Install-PnPApp -Identity $app.Id -Scope Site -Wait }
    }
}

$invokeParams = @{ Path = $TemplatePath; ClearNavigation = $true }
if ($SkipPages) { $invokeParams.ExcludeHandlers = 'Pages' }

Write-Host 'Kjører malen ...' -ForegroundColor Green
$sw = [Diagnostics.Stopwatch]::StartNew()
Invoke-PnPSiteTemplate @invokeParams
$sw.Stop()

if ($GrantEveryone) {
    $tenantId = Get-PnPTenantId
    $members = Get-PnPGroup -AssociatedMemberGroup
    $everyone = "c:0-.f|rolemanager|spo-grid-all-users/$tenantId"
    Write-Host "Legger «Alle unntatt eksterne brukere» i '$($members.Title)' ..." -ForegroundColor Green
    Add-PnPGroupMember -Group $members -LoginName $everyone
}

Write-Host ''
Write-Host "Ferdig på $($sw.Elapsed.ToString('mm\:ss'))." -ForegroundColor Green
Write-Host "Legg saksbehandlere i gruppen 'Saksbehandlere' og åpne $Url/SitePages/Hjem.aspx"
