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

Add-PnPFile -Path $(".\dist\SiteAssets\js\bundle.js") -Folder "SiteAssets\js\"       
Add-PnPFile -Path $(".\dist\SiteAssets\css\Main.css") -Folder "SiteAssets\css\"       
Add-PnPFile -Path $(".\dist\SitePages\Home.aspx") -Folder "SitePages\"       
Add-PnPFile -Path $(".\dist\SitePages\NyttForslag.aspx") -Folder "SitePages\"       
Add-PnPFile -Path $(".\dist\SitePages\Forslag.aspx") -Folder "SitePages\"       
Add-PnPFile -Path $(".\dist\SitePages\SendTilKS.aspx") -Folder "SitePages\"  
Add-PnPFile -Path $(".\dist\SitePages\Vurdering.aspx") -Folder "SitePages\"            
   