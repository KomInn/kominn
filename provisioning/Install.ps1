<#
.SYNOPSIS
    Bygger og installerer KomInn 2.0 på et eksisterende, moderne SharePoint-område.

.DESCRIPTION
    1. Bygger SPFx-løsningen (npm ci og npm run package) og får sharepoint/solution/kominn.sppkg.
    2. Laster opp og publiserer app-pakken i appkatalogen.
    3. Kjører PnP-malen template.xml: felt, innholdstyper, lister, gruppen Saksbehandlere,
       sider med KomInn-webdelene, navigasjon og ikoner for bærekraftsmålene.
    4. Gir eventuelt alle ansatte medlemstilgang (-GrantEveryone).

    Krav:
      - PnP.PowerShell 3.4 eller nyere (Install-Module PnP.PowerShell -Scope CurrentUser)
      - En Entra ID-appregistrering for PnP.PowerShell (Register-PnPEntraIDAppForInteractiveLogin)
      - Node.js 22 og npm, med mindre -SkipBuild brukes
      - Områdeeier på målområdet, og tilgang til appkatalogen med mindre -SkipApp brukes

.PARAMETER Url
    Områdets adresse, f.eks. https://kommune.sharepoint.com/sites/kominn

.PARAMETER ClientId
    Klient-ID for appregistreringen PnP.PowerShell logger på med.

.PARAMETER AppScope
    Tenant (standard) for leietakerens appkatalog, eller Site for områdets egen appkatalog.

.PARAMETER SkipBuild
    Bruk eksisterende sharepoint/solution/kominn.sppkg i stedet for å bygge.

.PARAMETER SkipApp
    Ikke last opp app-pakken. Brukes når pakken allerede er publisert.

.PARAMETER SkipPages
    Hopp over sidene med webdeler.

.PARAMETER GrantEveryone
    Legger «Alle unntatt eksterne brukere» i medlemsgruppen, slik at alle ansatte kan sende inn,
    like og kommentere.

.EXAMPLE
    ./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id> -GrantEveryone
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Url,
    [Parameter(Mandatory = $true)] [string] $ClientId,
    [Parameter(Mandatory = $false)] [ValidateSet('Tenant', 'Site')] [string] $AppScope = 'Tenant',
    [Parameter(Mandatory = $false)] [switch] $SkipBuild,
    [Parameter(Mandatory = $false)] [switch] $SkipApp,
    [Parameter(Mandatory = $false)] [switch] $SkipPages,
    [Parameter(Mandatory = $false)] [switch] $GrantEveryone
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
Write-Host "Koblet til '$($web.Title)'." -ForegroundColor Green

# 3. App-pakke
if (-not $SkipApp) {
    Write-Host "Laster opp app-pakken til appkatalogen ($AppScope) ..." -ForegroundColor Green
    $app = Add-PnPApp -Path $packagePath -Scope $AppScope -Publish -SkipFeatureDeployment -Overwrite
    Write-Host "Publisert: $($app.Title) $($app.AppCatalogVersion)"
    if ($AppScope -eq 'Site') {
        $installed = Get-PnPApp -Identity $app.Id -Scope Site
        if (-not $installed.InstalledVersion) { Install-PnPApp -Identity $app.Id -Scope Site -Wait }
    }
}

# 4. Mal
$invokeParams = @{ Path = $templatePath; ClearNavigation = $true }
if ($SkipPages) { $invokeParams.ExcludeHandlers = 'Pages' }
Write-Host 'Kjører malen ...' -ForegroundColor Green
$sw = [Diagnostics.Stopwatch]::StartNew()
Invoke-PnPSiteTemplate @invokeParams
$sw.Stop()

# 5. Tilgang for alle ansatte
if ($GrantEveryone) {
    $tenantId = Get-PnPTenantId
    $members = Get-PnPGroup -AssociatedMemberGroup
    Write-Host "Legger «Alle unntatt eksterne brukere» i '$($members.Title)' ..." -ForegroundColor Green
    Add-PnPGroupMember -Group $members -LoginName "c:0-.f|rolemanager|spo-grid-all-users/$tenantId"
}

Write-Host ''
Write-Host "Malen brukte $($sw.Elapsed.ToString('mm\:ss'))." -ForegroundColor Green
Write-Host "Legg saksbehandlere i gruppen 'Saksbehandlere' og åpne $Url/SitePages/Hjem.aspx"
