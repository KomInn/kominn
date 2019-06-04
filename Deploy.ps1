

# AppFilesPath - skal peke til rotstien for løsningen, der denne filen ligger. 
$AppFilesPath = "C:\...";

# Endre disse verdiene for å provisjonere på ditt miljø
$env = @{   
    SiteURL = "https://TENANT.sharepoint.com/"; 
    User = "bruker@tenant.onmicrosoft.com"; 
Pwd = ConvertTo-SecureString "Skriv inn passordet her" -AsPlainText -Force
}; 

# Fjern kommentartegnet på dennne dersom du ikke allerede har installert SharePointPnPPowerShellOnline-modulen
#Install-Module SharePointPnPPowerShellOnline -AllowClobber -WarningAction SilentlyContinue 

$cred = New-Object -typename System.Management.Automation.PSCredential -ArgumentList $env.User, $env.Pwd
# Koble til SharePoint
Connect-PnPOnline -Url $($env.SiteURL) -Credentials $cred

Add-PnPFile -Path $($AppFilesPath + "dist\SiteAssets\js\bundle.js") -Folder "SiteAssets\js\"       
Add-PnPFile -Path $($AppFilesPath + "dist\SiteAssets\css\Main.css") -Folder "SiteAssets\css\"       

Add-PnPFile -Path $($AppFilesPath + "dist\SitePages\Home.aspx") -Folder "SitePages\"       
Add-PnPFile -Path $($AppFilesPath + "dist\SitePages\NyttForslag.aspx") -Folder "SitePages\"       
Add-PnPFile -Path $($AppFilesPath + "dist\SitePages\Forslag.aspx") -Folder "SitePages\"       
Add-PnPFile -Path $($AppFilesPath + "dist\SitePages\SendTilKS.aspx") -Folder "SitePages\"  
Add-PnPFile -Path $($AppFilesPath + "dist\SitePages\Vurdering.aspx") -Folder "SitePages\"            
   