<#
.SYNOPSIS
    Installerer KomInn 2.0 på et eksisterende, moderne SharePoint-område.

.DESCRIPTION
    Kjører PnP-malen template.xml mot området. Malen oppretter felt, innholdstyper, lister,
    gruppen Saksbehandlere, sider med KomInn-webdelene og navigasjon, og laster opp ikonene
    for bærekraftsmålene.

    Krav:
      - PnP.PowerShell 3.4 eller nyere (Install-Module PnP.PowerShell -Scope CurrentUser)
      - En Entra ID-appregistrering for PnP.PowerShell (Register-PnPEntraIDAppForInteractiveLogin)
      - App-pakken kominn.sppkg distribuert i appkatalogen (globalt / skipFeatureDeployment)
      - Områdeeier på målområdet

.PARAMETER Url
    Områdets adresse, f.eks. https://kommune.sharepoint.com/sites/kominn

.PARAMETER ClientId
    Klient-ID for appregistreringen PnP.PowerShell logger på med.

.PARAMETER Tenant
    Leietaker, f.eks. kommune.onmicrosoft.com. Valgfritt.

.PARAMETER SkipPages
    Hopp over sidene. Brukes når app-pakken ikke er distribuert enda; sidene kan legges på senere.

.EXAMPLE
    ./Install.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId 11111111-2222-3333-4444-555555555555
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Url,
    [Parameter(Mandatory = $true)] [string] $ClientId,
    [Parameter(Mandatory = $false)] [string] $Tenant,
    [Parameter(Mandatory = $false)] [string] $TemplatePath = (Join-Path $PSScriptRoot 'template.xml'),
    [Parameter(Mandatory = $false)] [switch] $SkipPages
)

#Requires -Modules @{ ModuleName = 'PnP.PowerShell'; ModuleVersion = '3.4.0' }
$ErrorActionPreference = 'Stop'

if (-not (Test-Path $TemplatePath)) {
    throw "Finner ikke malen '$TemplatePath'."
}

Write-Host ''
Write-Host 'KomInn 2.0' -ForegroundColor Green
Write-Host "Område:  $Url"
Write-Host "Mal:     $TemplatePath"
Write-Host ''

$connectParams = @{ Url = $Url; ClientId = $ClientId; Interactive = $true }
if ($Tenant) { $connectParams.Tenant = $Tenant }
Connect-PnPOnline @connectParams

$web = Get-PnPWeb
Write-Host "Koblet til '$($web.Title)'. Starter provisjonering ..." -ForegroundColor Green

$invokeParams = @{ Path = $TemplatePath; ClearNavigation = $true }
if ($SkipPages) { $invokeParams.ExcludeHandlers = 'PageContents' }

$sw = [Diagnostics.Stopwatch]::StartNew()
Invoke-PnPSiteTemplate @invokeParams
$sw.Stop()

Write-Host ''
Write-Host "Ferdig på $($sw.Elapsed.ToString('mm\:ss'))." -ForegroundColor Green
Write-Host "Legg saksbehandlere i gruppen 'Saksbehandlere' og åpne $Url/SitePages/Hjem.aspx"
