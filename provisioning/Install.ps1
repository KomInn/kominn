<#
.SYNOPSIS
    Bygger og installerer KomInn 2.0 på et eksisterende, moderne SharePoint-område.

.DESCRIPTION
    1. Bygger SPFx-løsningen (npm ci og npm run package) og får sharepoint/solution/kominn.sppkg.
    2. Laster opp og publiserer app-pakken i appkatalogen, og installerer den på området.
    3. Kjører PnP-malen template.xml: felt, innholdstyper, lister, gruppene Saksbehandlere og Idéinnspillere
       med rettigheter, sider med KomInn-webdelene, navigasjon og ikoner for bærekraftsmålene.
    4. Tilgang gis manuelt etterpå: legg kommunens Entra-grupper i Idéinnspillere og Saksbehandlere.

    Rettigheter (settes av malen):
      - Idéinnspillere: lese på området, bidra i Forslag, Kommentarer, Likes og Bilder. Ser alle forslag,
        men kan bare endre og slette sine egne. Ingen tilgang til Forslagsvurdering.
      - Saksbehandlere: redigere på området og alle forslag, bidra i Forslagsvurdering.

    Krav:
      - PnP.PowerShell 3.4 eller nyere (Install-Module PnP.PowerShell -Scope CurrentUser)
      - En Entra ID-appregistrering for PnP.PowerShell (Register-PnPEntraIDAppForInteractiveLogin)
      - Node.js 22 og npm, med mindre -SkipBuild brukes
      - Områdeeier på målområdet, og tilgang til appkatalogen med mindre -SkipApp brukes

.PARAMETER Url
    Områdets adresse, f.eks. https://kommune.sharepoint.com/sites/kominn

.PARAMETER ClientId
    Klient-ID for appregistreringen PnP.PowerShell logger på med.
    Standard er Prosjektportalens multi-tenant-app for interaktiv PnP-innlogging, som fungerer i de fleste
    tenanter der den er godkjent. Oppgi egen verdi for å bruke en annen appregistrering.

.PARAMETER AppScope
    Tenant (standard) for leietakerens appkatalog, eller Site for områdets egen appkatalog.

.PARAMETER SkipBuild
    Bruk eksisterende sharepoint/solution/kominn.sppkg i stedet for å bygge.

.PARAMETER SkipApp
    Ikke last opp app-pakken. Brukes når pakken allerede er publisert.

.PARAMETER SkipPages
    Hopp over sidene med webdeler.

.EXAMPLE
    ./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Url,
    [string] $ClientId = 'da6c31a6-b557-4ac3-9994-7315da06ea3a',
    [Parameter(Mandatory = $false)] [ValidateSet('Tenant', 'Site')] [string] $AppScope = 'Tenant',
    [Parameter(Mandatory = $false)] [switch] $SkipBuild,
    [Parameter(Mandatory = $false)] [switch] $SkipApp,
    [Parameter(Mandatory = $false)] [switch] $SkipPages
)

#Requires -Modules @{ ModuleName = 'PnP.PowerShell'; ModuleVersion = '3.4.0' }
$ErrorActionPreference = 'Stop'

$root = Split-Path $PSScriptRoot -Parent
$templatePath = Join-Path $PSScriptRoot 'template.xml'
$packagePath = Join-Path $root 'sharepoint/solution/kominn.sppkg'

Write-Host ''
Write-Host 'KomInn 2.0' -ForegroundColor Green
Write-Host "Område:  $Url"
Write-Host ''

# 1. Bygg
if (-not $SkipApp -and -not $SkipBuild) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Finner ikke npm. Installer Node.js 22, eller bruk -SkipBuild.' }
    Write-Host 'Bygger SPFx-løsningen ...' -ForegroundColor Green
    Push-Location $root
    try {
        npm ci --no-fund --no-audit
        if ($LASTEXITCODE -ne 0) { throw 'npm ci feilet.' }
        npm run package
        if ($LASTEXITCODE -ne 0) { throw 'npm run package feilet.' }
    }
    finally { Pop-Location }
}
if (-not $SkipApp -and -not (Test-Path $packagePath)) { throw "Finner ikke app-pakken '$packagePath'." }

# 2. Logg på
Connect-PnPOnline -Url $Url -Interactive -ClientId $ClientId
$web = Get-PnPWeb
$siteUrl = $web.Url
Write-Host "Koblet til '$($web.Title)': $siteUrl" -ForegroundColor Green

$catalogUrl = if ($AppScope -eq 'Site') { "$siteUrl/AppCatalog" } else {
    try { Get-PnPTenantAppCatalogUrl } catch { '(leietakerens appkatalog)' }
}

# 3. App-pakke
if (-not $SkipApp) {
    Write-Host "Laster opp app-pakken til $catalogUrl ..." -ForegroundColor Green
    $app = Add-PnPApp -Path $packagePath -Scope $AppScope -Publish -Overwrite
    Write-Host "Publisert: $($app.Title) $($app.AppCatalogVersion)"
}

# App-pakken må være installert på området for at webdelene skal vises på sidene.
$app = Get-PnPApp -Scope $AppScope | Where-Object { $_.Title -eq 'kominn' } | Select-Object -First 1
if (-not $app) { throw "Finner ikke app-pakken 'kominn' i appkatalogen ($AppScope). Kjør uten -SkipApp." }
if (-not $app.Deployed) { throw "App-pakken 'kominn' er lastet opp, men ikke distribuert i appkatalogen." }
if (-not $app.InstalledVersion) {
    Write-Host "Installerer app-pakken på $siteUrl ..." -ForegroundColor Green
    Install-PnPApp -Identity $app.Id -Scope $AppScope -Wait
}
elseif ([version]$app.InstalledVersion -gt [version]$app.AppCatalogVersion) {
    # Katalogen har en lavere versjon enn den som er installert, f.eks. når versjonen er satt tilbake før lansering.
    Write-Host "Installerer app-pakken på nytt på $siteUrl ($($app.InstalledVersion) -> $($app.AppCatalogVersion)) ..." -ForegroundColor Yellow
    Uninstall-PnPApp -Identity $app.Id -Scope $AppScope
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 5
        if (-not (Get-PnPApp -Identity $app.Id -Scope $AppScope).InstalledVersion) { break }
    }
    Install-PnPApp -Identity $app.Id -Scope $AppScope -Wait
}
elseif ($app.CanUpgrade) {
    Write-Host "Oppgraderer app-pakken på $siteUrl fra $($app.InstalledVersion) til $($app.AppCatalogVersion) ..." -ForegroundColor Green
    Update-PnPApp -Identity $app.Id -Scope $AppScope
}
else {
    Write-Host "App-pakken er installert på $siteUrl ($($app.InstalledVersion))."
}

# 4. Mal
$invokeParams = @{ Path = $templatePath; ClearNavigation = $true }
if ($SkipPages) { $invokeParams.ExcludeHandlers = 'Pages' }
Write-Host "Kjører malen mot $siteUrl ..." -ForegroundColor Green
$sw = [Diagnostics.Stopwatch]::StartNew()
Invoke-PnPSiteTemplate @invokeParams
$sw.Stop()

# 5. Tilgang
# Eldre versjoner av skriptet (-GrantEveryone) la «Alle unntatt eksterne brukere» i Medlemmer, som har
# redigeringsrettigheter på hele området. Tilgang for ansatte gis nå gjennom Idéinnspillere.
$members = Get-PnPGroup -AssociatedMemberGroup
Get-PnPGroupMember -Group $members | Where-Object { $_.LoginName -like '*spo-grid-all-users*' } | ForEach-Object {
    Write-Host "Fjerner «$($_.Title)» fra '$($members.Title)'. Bruk Idéinnspillere for tilgang for ansatte." -ForegroundColor Yellow
    Remove-PnPGroupMember -Group $members -LoginName $_.LoginName
}

Write-Host ''
Write-Host "Malen brukte $($sw.Elapsed.ToString('mm\:ss'))." -ForegroundColor Green
Write-Host "Installert på: $siteUrl" -ForegroundColor Green
Write-Host ''
Write-Host 'Gi tilgang i SharePoint (Innstillinger > Områdetillatelser):' -ForegroundColor Cyan
Write-Host "  - Idéinnspillere: kommunens Entra-gruppe for ansatte. Kan sende inn, like og kommentere."
Write-Host "  - Saksbehandlere: de som vurderer forslag og endrer status."
Write-Host ''
Write-Host "Åpne $siteUrl/SitePages/Hjem.aspx"
