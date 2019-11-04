Param(
    [Parameter(Mandatory = $true, HelpMessage = "Where do you want to install the Project Portal?")]
    [string]$Url,
    [Parameter(Mandatory = $false, HelpMessage = "Do you want to handle PnP libraries and PnP PowerShell without using bundled files?")]
    [switch]$SkipLoadingBundle,
    [Parameter(Mandatory = $false, HelpMessage = "Stored credential from Windows Credential Manager")]
    [string]$GenericCredential,
    [Parameter(Mandatory = $false, HelpMessage = "Use Web Login to connect to SharePoint. Useful for e.g. ADFS environments.")]
    [switch]$UseWebLogin,
    [Parameter(Mandatory = $false, HelpMessage = "Use the credentials of the current user to connect to SharePoint. Useful e.g. if you install directly from the server.")]
    [switch]$CurrentCredentials,
    [Parameter(Mandatory = $false, HelpMessage = "Active SharePoint connection (Used by script)")]
    [Object]$Connection,
    [Parameter(Mandatory = $false, HelpMessage = "PowerShell credential to authenticate with")]
    [System.Management.Automation.PSCredential]$PSCredential,
    [Parameter(Mandatory = $false, HelpMessage = "Installation Environment. If SkipLoadingBundle is set, this will be ignored")]
    [ValidateSet('SharePointPnPPowerShell2013', 'SharePointPnPPowerShell2016', 'SharePointPnPPowerShellOnline')]
    [string]$Environment = "SharePointPnPPowerShellOnline",
    [Parameter(Mandatory = $false)]
    [ValidateSet('None', 'File', 'Host')]
    [string]$Logging = "File",
    [Parameter(Mandatory = $false)]
    [Hashtable]$Parameters
)

function LoadBundle($Environment) {
    $BundlePath = "$PSScriptRoot\..\bundle\$Environment"
    Add-Type -Path "$BundlePath\Microsoft.SharePoint.Client.Taxonomy.dll" -ErrorAction SilentlyContinue
    Add-Type -Path "$BundlePath\Microsoft.SharePoint.Client.DocumentManagement.dll" -ErrorAction SilentlyContinue
    Add-Type -Path "$BundlePath\Microsoft.SharePoint.Client.WorkflowServices.dll" -ErrorAction SilentlyContinue
    Add-Type -Path "$BundlePath\Microsoft.SharePoint.Client.Search.dll" -ErrorAction SilentlyContinue
    Add-Type -Path "$BundlePath\Newtonsoft.Json.dll" -ErrorAction SilentlyContinue
    Import-Module "$BundlePath\$Environment.psd1" -ErrorAction SilentlyContinue -WarningAction SilentlyContinue
}

# Loads bundle if switch SkipLoadingBundle is not present
if (-not $SkipLoadingBundle.IsPresent) {
    LoadBundle -Environment $Environment
}
$LoadedPnPCommand = Get-Command Connect-PnPOnline
$LoadedPnPCommandVersion = $LoadedPnPCommand.Version
$LoadedPnPCommandSource = $LoadedPnPCommand.Source


# Handling credentials
if ($PSCredential -ne $null) {
    $Credential = $PSCredential
}
elseif ($GenericCredential -ne $null -and $GenericCredential -ne "") {
    $Credential = Get-PnPStoredCredential -Name $GenericCredential -Type PSCredential 
}
elseif ($Credential -eq $null -and -not $UseWebLogin.IsPresent -and -not $CurrentCredentials.IsPresent) {
    $Credential = (Get-Credential -Message "Please enter your username and password")
}

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

$SiteConnection = Connect-PnPOnline -Url $Url -Credentials $Credential -ReturnConnection

Apply-PnPProvisioningTemplate .\root.pnp -Handlers All -Connection $SiteConnection

$sw.Stop()
Write-Host "Installation completed in $($sw.Elapsed)" -ForegroundColor Green