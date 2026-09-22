<#
.SYNOPSIS
    Installerer KomInn 2.0 på et eksisterende, moderne SharePoint-område.
.DESCRIPTION
    Krever PnP.PowerShell 3.4 eller nyere og en Entra ID-appregistrering for PnP.PowerShell.
    App-pakken (kominn.sppkg) må være lagt i appkatalogen på forhånd.
.EXAMPLE
    ./Install.ps1 -Url https://asker.sharepoint.com/sites/kominn -ClientId <app-id>
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Url,
    [Parameter(Mandatory = $true)] [string] $ClientId,
    [Parameter(Mandatory = $false)] [string] $Tenant,
    [Parameter(Mandatory = $false)] [string] $TemplatePath = "$PSScriptRoot/template.xml"
)

#Requires -Modules @{ ModuleName = 'PnP.PowerShell'; ModuleVersion = '3.4.0' }
$ErrorActionPreference = 'Stop'

Write-Host "KomInn 2.0 – installerer til $Url" -ForegroundColor Green

$connectParams = @{ Url = $Url; ClientId = $ClientId; Interactive = $true }
if ($Tenant) { $connectParams.Tenant = $Tenant }
Connect-PnPOnline @connectParams

if (-not (Test-Path $TemplatePath)) {
    throw "Finner ikke malen '$TemplatePath'. Malen leveres i WP2."
}

Invoke-PnPSiteTemplate -Path $TemplatePath -ClearNavigation
Write-Host "Ferdig." -ForegroundColor Green
