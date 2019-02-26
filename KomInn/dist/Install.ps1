# Sti til .\dist (F.eks: C:\Dev\KomInn\dist\)
$InstalledFilesPath = "C:\dev\kominn-master\kominn\KomInn\Webapp\dist"; 

# Sti til rot  (ex. https://contoso.sharepoint.com) 
$RootTenant = "https://smebydev.sharepoint.com/"

# Sti til områdesamlingen (ex. https://contoso.sharepoint.com/sites/kominn) 
$SolutionSite = "https://smebydev.sharepoint.com/sites/kominntest3"

# Brukernavn som det skal kobles til med, må være sitecollectionadmin på områdesamlingen
$User = "helge@smeby.org";

$Credentials = Get-Credential -UserName $User  -Message "Oppgi brukernavn og passord"; 


# Fjern kommentartegnet for å installere PowerShell-modulen 
#Install-Module SharePointPnPPowerShellOnline -AllowClobber -WarningAction SilentlyContinue 

powershell.exe $($InstalledFilesPath + "\ListInstall.ps1")

# Legger til alle postnumre i Norge, denne operasjonen tar lang tid 
Function AddPostalCodes()
{

Write-Host "WARNING!" -ForegroundColor Yellow 
Write-Host "This operation can take SEVERAL HOURS to complete. Are you sure you want to run it? [Y/N] (default: N)"
$c = Read-Host 
If($c -ne "Y")
{ return; }


$data = import-csv -Path $($InstalledFilesPath + "\Postnummerregister_ansi.txt") -Delimiter "`t"  -Header "Postnummer", "Sted", "Kommunenummer", "Kommune", "Ex" -Encoding default
foreach ($row in $data) { 
  Add-PnPListItem -List "Kommunenumre" -Values @{"Title" = $row."Sted".ToString(); "Sted"=$row."Sted".ToString(); "Kommunenummer"=$row."Kommunenummer".ToString(); "Postnummer"=$row."Postnummer".ToString(); "Kommune"=$row."Kommune".ToString();  "Ex"="P";}       
}
}


Function CopyFiles()
{
Remove-PnPFile -SiteRelativeUrl "\SitePages\Forslag.aspx" -ErrorAction SilentlyContinue -Confirm:$false  -Force
Remove-PnPFile -SiteRelativeUrl "\SitePages\Home.aspx" -ErrorAction SilentlyContinue -Confirm:$false -Force
Remove-PnPFile -SiteRelativeUrl "\SitePages\NyttForslag.aspx" -ErrorAction SilentlyContinue -Confirm:$false  -Force

Remove-PnPFile -SiteRelativeUrl "\SiteAssets\js\bundle.js" -ErrorAction SilentlyContinue -Confirm:$false -Force
Remove-PnPFile -SiteRelativeUrl "\SiteAssets\css\Style.css" -ErrorAction SilentlyContinue -Confirm:$false -Force

Add-PnPFile -Path $($InstalledFilesPath + "\SitePages\Forslag.aspx") -Folder "SitePages" 
Add-PnPFile -Path $($InstalledFilesPath + "\SitePages\Home.aspx") -Folder "SitePages" 
Add-PnPFile -Path $($InstalledFilesPath + "\SitePages\NyttForslag.aspx") -Folder "SitePages" 

 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\bootstrap\css\bootstrap.min.css") -Folder "SiteAssets\lib\bootstrap\css"
 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\bootstrap\js\bootstrap.min.js") -Folder "SiteAssets\lib\bootstrap\js"
 
  Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\bootstrap\fonts\glyphicons-halflings-regular.woff2") -Folder "SiteAssets\lib\bootstrap\fonts"
 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\bootstrap\fonts\glyphicons-halflings-regular.woff") -Folder "SiteAssets\lib\bootstrap\fonts"
 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\bootstrap\fonts\glyphicons-halflings-regular.ttf") -Folder "SiteAssets\lib\bootstrap\fonts"
 
 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\jquery\jquery.min.js") -Folder "SiteAssets\lib\jquery"
 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\react\react.min.js") -Folder "SiteAssets\lib\react"
 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\lib\react-dom\react-dom.min.js") -Folder "SiteAssets\lib\react-dom"
     
 Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\js\bundle.js") -Folder "SiteAssets\js"
  Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\css\Style.css") -Folder "SiteAssets\css"
  Add-PnPFile -Path $($InstalledFilesPath + "\SiteAssets\css\Main.css") -Folder "SiteAssets\css"
 }

 Function InstallLists()
{

$title = "Ikoner"; 
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue -Force
New-PnPList -Title $title -Template DocumentLibrary -Url "Ikoner"   -QuickLaunchOptions Off       
   
    
$title = "Kampanje"; 
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue  -Force
New-PnPList -Title $title -Template GenericList -Url "Kampanje"   -QuickLaunchOptions Off       
Add-PnPField -List $title -DisplayName "Startdato" -InternalName "StartDate" -Type DateTime -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Sluttdato" -InternalName "EndDate" -Type DateTime -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Tekst" -InternalName "Text" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Kampanjereferanse" -InternalName "CompRef" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Plassering" -InternalName "Placement" -Type Number -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Type" -InternalName "Type" -Type Choice -Group $group -AddToDefaultView -Choices "Standard", "Kampanje", "Fortid"
  
 $title = "Baerekraftsmaal"; 
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue  -Force
$list = New-PnPList -Title $title -Template GenericList -Url "Baerekraftsmaal" 
$guid = [guid]::NewGuid().ToString();
$lookupFieldXml = $("<Field ID='{"+$guid+"}' Name='Ikon' Group='KomInn' Type='Lookup' DisplayName='Ikon' List='Lists/Ikoner' ShowField='Title' />"); 
Add-PnPFieldFromXml -FieldXml $lookupFieldXml -List $list 
  
    
$title = "Forslag";  
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue -Force
$list = New-PnPList -Title $title -Template GenericList -Url "Forslag"   -QuickLaunchOptions Off       
Add-PnPField -List $title -DisplayName "Oppsummering" -InternalName "Summary" -Type Note -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Utfordringer" -InternalName "Challenges" -Type Note -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Forslag til løsning" -InternalName "SuggestedSolution" -Type Note -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Likes" -InternalName "Likes" -Type Number -Group $group -AddToDefaultView 
Add-PnPField -List $title -DisplayName "Bilde" -InternalName "Image" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Sted" -InternalName "Location" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Nyttig for andre" -InternalName "UsefulForOthers" -Type Note -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Type nytte" -InternalName "UsefulnessType" -Type Choice -Group $group -AddToDefaultView -Choices "Fag", "Folk", "Penger"
Add-PnPField -List $title -DisplayName "Tags" -InternalName "Tags" -Type MultiChoice -Group $group -AddToDefaultView -Choices "Kommunalt", "Skole", "Barnehage"
Add-PnPField -List $title -DisplayName "AntallKommentarer" -InternalName "NumberOfComments" -Type Number -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Nærmeste leder" -InternalName "Manager" -Type User -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Kommunenummer" -InternalName "CountyCode" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Navn" -InternalName "Name" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Adresse" -InternalName "Address" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Epost adresse" -InternalName "MailAddress" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Telefon" -InternalName "Telephone" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Postnummer" -InternalName "Zipcode" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "By" -InternalName "City" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Avdeling" -InternalName "Department" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Status" -InternalName "Status" -Type Choice -Group $group -AddToDefaultView -Choices "Sendt inn", "Publisert", "Kladd", "Suksess", "Promotert" 
Add-PnPField -List $title -DisplayName "Konkurransereferanse" -InternalName "CompRef" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Saksbehandler" -InternalName "CaseWorker" -Type User -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Send til KS" -InternalName "SendToKS" -Type Boolean -Group $group -AddToDefaultView 
Add-PnPField -List $title -DisplayName "Månedens forslag startdato" -InternalName "MonthlyStartDate" -Type DateTime -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Månedens forslag sluttdato" -InternalName "MonthlyEndDate" -Type DateTime -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Fortid" -InternalName "IsPast" -Type Boolean -Group $group -AddToDefaultView 
$guid = [guid]::NewGuid().ToString();
$lookupFieldXml = $("<Field ID='{"+$guid+"}' Name='Bærekraftsmål' Group='KomInn' Type='LookupMulti' DisplayName='Forslag' List='Lists/Baerekraftsmaal' ShowField='Title' />"); 
Add-PnPFieldFromXml -FieldXml $lookupFieldXml -List $list
 
$guid = [guid]::NewGuid().ToString();
$lookupFieldXml = $("<Field ID='{"+$guid+"}' Name='InspiredBy' Group='KomInn' Type='LookupMulti' DisplayName='InspiredBy' List='Lists/Forslag' ShowField='Title' />"); 
Add-PnPFieldFromXml -FieldXml $lookupFieldXml -List $list
    


$title = "Bilder";   
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue  -Force
New-PnPList -Title $title -Template PictureLibrary -Url "Bilder" 

    
$title = "Likes";   
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue   -Force
$list = New-PnPList -Title $title -Template GenericList -Url "Likes"   -QuickLaunchOptions Off          
$guid = [guid]::NewGuid().ToString();
$lookupFieldXml = $("<Field ID='{"+$guid+"}' Name='Forslag' Group='KomInn' Type='Lookup' DisplayName='Forslag' List='Lists/Forslag' ShowField='Title' />"); 
Add-PnPFieldFromXml -FieldXml $lookupFieldXml -List $list


$title = "Kommentarer";    
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue  -Force
New-PnPList -Title $title -Template GenericList -Url "Kommentarer"   -QuickLaunchOptions Off       
Add-PnPField -List $title -DisplayName "Tekst" -InternalName "Text" -Type Note -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Bilde" -InternalName "Image" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Forslag" -InternalName "SuggestionId" -Type Number -Group $group -AddToDefaultView
      
      

$title = "InductKonfigurasjon"; 
Remove-PnPList -Identity $title -ErrorAction SilentlyContinue  -Force
New-PnPList -Title $title -Template GenericList -Url "InductKonfigurasjon" 
Add-PnPField -List $title -DisplayName "KlientID" -InternalName "KlientID" -Type Text -Group $group -AddToDefaultView
Add-PnPField -List $title -DisplayName "Anonym" -InternalName "Anonym" -Type Boolean -Group $group -AddToDefaultView

}


 Write-Host "KomInn installer. Choose an option and press Enter:"; 
 Write-Host " 1 - Create site collection"
 Write-Host " 2 - Create lists"
 Write-Host " 3 - Copy files"
 Write-Host " 4 - Add postal codes"

$Choice = Read-Host;
If($Choice -eq "1")
{
Write-Host "Oppretter område..."; 
Connect-PnPOnline -Url $RootTenant -Credentials $Credentials 
New-PnPTenantSite -Title "KomInn" -Url $SolutionSite -Description "" -Owner $User -TimeZone 4
Write-Host "Område opprettet. Sørg for at du har tilgang til området før du går videre med stegene i scriptet." 
  
}
If($Choice -eq "2")
{
  Write-Host "Oppretter lister"; 
  Connect-PnPOnline -Url $SolutionSite -Credentials $Credentials 
  InstallLists
  Write-Host "Lister opprettet"; 
}

If($Choice -eq "3")
{
Connect-PnPOnline -Url $SolutionSite -Credentials $Credentials 
 CopyFiles 
}

If($Choice -eq "4")
{
Connect-PnPOnline -Url $SolutionSite -Credentials $Credentials 
    AddPostalCodes 
}