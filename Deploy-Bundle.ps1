Param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $true)]
    [string]$UserName,
    [Parameter(Mandatory = $true)]
    [string]$Password
)


$PasswordSecure = ConvertTo-SecureString $Password -AsPlainText -Force

$Credentials = New-Object -typename System.Management.Automation.PSCredential -ArgumentList $UserName, $PasswordSecure
Connect-PnPOnline -Url $Url -Credentials $Credentials

Add-PnPFile -Path $("./templates/root/SiteAssets/js/bundle.js") -Folder "SiteAssets\js" 