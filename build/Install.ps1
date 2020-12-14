Param(
    [Parameter(Mandatory = $true, HelpMessage = "Where do you want to install KomInn?")]
    [string]$Url,
    [Parameter(Mandatory = $false)]
    [ValidateSet('None', 'File', 'Host')]
    [string]$Logging = "File",
    [Parameter(Mandatory = $false)]
    [Hashtable]$Parameters
)

$LoadedPnPCommand = Get-Command Connect-PnPOnline -ErrorAction Stop
$LoadedPnPCommandVersion = $LoadedPnPCommand.Version
$LoadedPnPCommandSource = $LoadedPnPCommand.Source

# Starts stop watch
$sw = [Diagnostics.Stopwatch]::StartNew()
$ErrorActionPreference = "Stop"

# Sets up PnP trace log
if ($Logging -eq "File") {
    $execDateTime = Get-Date -Format "yyyyMMdd_HHmmss"
    Set-PnPTraceLog -On -Level Debug -LogFile "install-$execDateTime.txt"
}
elseif ($Logging -eq "Host") {
    Set-PnPTraceLog -On -Level Debug
}
else {
    Set-PnPTraceLog -Off
}

Write-Host "############################################################################" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "KomInn is maintained by Puzzlepart @ https://github.com/Puzzlepart/kominn" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "Installing KomInn" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "Installation URL:`t`t$Url" -ForegroundColor Green
Write-Host "PnP Environment:`t`t$LoadedPnPCommandSource ($LoadedPnPCommandVersion)" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "Note: The install requires site collection admin" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Green
Write-Host "############################################################################" -ForegroundColor Green

Connect-PnPOnline -Url $Url -UseWebLogin

Apply-PnPProvisioningTemplate .\root.pnp

$sw.Stop()
Write-Host "Installation completed in $($sw.Elapsed)" -ForegroundColor Green
