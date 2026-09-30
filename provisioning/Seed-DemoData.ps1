<#
.SYNOPSIS
    Fyller et KomInn-område med demodata: forslag i alle statuser, kommentarer og vurderinger.

.DESCRIPTION
    Alle demoforslag merkes med konkurransereferansen DEMO. Skriptet hopper over forslag som
    allerede finnes (samme tittel og DEMO-merke), så det kan kjøres flere ganger.
    Med -Remove slettes alle DEMO-forslag. Kommentarer, likes og vurderinger som peker på dem
    slettes automatisk av SharePoint (oppslagsfeltene har Cascade).

    Kommentarer og vurderinger opprettes i navnet til brukeren som kjører skriptet.
    Antall liker og kommentarer på forslagene er satt for visning. Første gang noen trykker
    Lik eller kommenterer, telles de opp på nytt fra listene.

    Krever PnP.PowerShell 3.4 eller nyere, og at malen er kjørt på området.

.PARAMETER Url
    Områdets adresse, f.eks. https://kommune.sharepoint.com/sites/kominn

.PARAMETER ClientId
    Klient-ID for appregistreringen PnP.PowerShell logger på med.

.PARAMETER Remove
    Slett demodataene i stedet for å opprette dem.

.EXAMPLE
    ./Seed-DemoData.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id>

.EXAMPLE
    ./Seed-DemoData.ps1 -Url https://kommune.sharepoint.com/sites/kominn -ClientId <app-id> -Remove
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Url,
    [Parameter(Mandatory = $true)] [string] $ClientId,
    [Parameter(Mandatory = $false)] [switch] $Remove
)

#Requires -Modules @{ ModuleName = 'PnP.PowerShell'; ModuleVersion = '3.4.0' }
$ErrorActionPreference = 'Stop'

$DemoRef = 'DEMO'
$SuggestionList = 'Forslag'
$CommentList = 'Kommentarer'
$EvaluationList = 'Forslagsvurdering'
$GoalList = 'Baerekraftsmaal'

Connect-PnPOnline -Url $Url -Interactive -ClientId $ClientId
$web = Get-PnPWeb
Write-Host "Koblet til '$($web.Title)'." -ForegroundColor Green

$existing = @(Get-PnPListItem -List $SuggestionList -PageSize 500 -Fields 'Title', 'KmiCompRef' |
    Where-Object { $_['KmiCompRef'] -eq $DemoRef })

if ($Remove) {
    if ($existing.Count -eq 0) { Write-Host 'Fant ingen demodata.'; return }
    Write-Host "Sletter $($existing.Count) demoforslag ..." -ForegroundColor Yellow
    foreach ($item in $existing) { Remove-PnPListItem -List $SuggestionList -Identity $item.Id -Force }
    Write-Host 'Ferdig.' -ForegroundColor Green
    return
}

# Bærekraftsmål: nummer -> listeelement-id
$goals = @{}
foreach ($g in Get-PnPListItem -List $GoalList -PageSize 50 -Fields 'Title') {
    if ($g['Title'] -match '^Mål\s+(\d+)') { $goals[[int]$Matches[1]] = $g.Id }
}
if ($goals.Count -eq 0) { throw "Finner ingen bærekraftsmål i $GoalList. Kjør Install.ps1 først." }

$today = (Get-Date).Date
function DaysAgo([int] $n) { return $today.AddDays(-$n) }

# Demoforslag. Key brukes til «inspirert av» og kommentarer.
$demo = @(
    @{ Key = 'sol'; Title = 'Solceller på Risenga svømmehall'; Summary = 'Montere solcelleanlegg på taket for å dekke deler av strømforbruket til varmepumpene i bassenget.'
       Challenges = 'Svømmehallen er en av kommunens største strømforbrukere, med høy last på dagtid om sommeren.'; Amount = 450000
       Areas = @('Fremtidsrettede bygg og anlegg'); Tags = @('Kommunalt'); Goals = @(7, 13); Location = '59.82720,10.43940'
       Status = 'Publisert'; CwStatus = 'Vurderes'; Name = 'Kari Nordmann'; Department = 'Eiendom'; Likes = 14; Created = 12 }
    @{ Key = 'mat'; Title = 'Klimasmart meny i skolekantinene'; Summary = 'Én vegetarisk dag i uken og mer lokale råvarer i alle kommunale kantiner, i samarbeid med elevrådene.'
       Challenges = 'Kjøttbasert meny gir høye utslipp og mye matsvinn.'; Amount = 80000
       Areas = @('Klimasmart mat'); Tags = @('Skole'); Goals = @(2, 12)
       Status = 'Publisert'; CwStatus = 'Godtatt'; Name = 'Per Hansen'; Department = 'Oppvekst'; Likes = 27; Created = 30; Monthly = $true }
    @{ Key = 'sykkel'; Title = 'Sykkelparkering under tak ved alle rådhusinnganger'; Summary = 'Trygg og tørr sykkelparkering med ladepunkt for elsykler ved rådhuset og servicetorget.'
       Amount = 120000; Areas = @('Grønn mobilitet'); Tags = @('Kommunalt'); Goals = @(11, 3); Location = '59.83400,10.43500'
       Status = 'Suksess'; CwStatus = 'Godtatt'; Name = 'Anne Berg'; Department = 'Eiendom'; Likes = 41; Created = 200 }
    @{ Key = 'mobler'; Title = 'Gjenbrukslager for kontormøbler'; Summary = 'Felles lager der virksomheter kan hente og levere brukte møbler før de kjøper nytt.'
       Challenges = 'Brukbare møbler kastes ved flytting og ombygging.'; Amount = 60000
       Areas = @('Bærekraftig forbruk'); Tags = @('Kommunalt'); Goals = @(12); InspiredBy = @('sykkel')
       Status = 'Promotert'; CwStatus = 'Godtatt'; Name = 'Kari Nordmann'; Department = 'Innkjøp'; Likes = 19; Created = 45 }
    @{ Key = 'skog'; Title = 'Skogplanting på kommunal tomt i Heggedal'; Summary = 'Plante 2 000 trær som karbonlager og nytt turområde, med skoleklasser som dugnadsgjeng.'
       Amount = 95000; Areas = @('Naturen som karbonlager'); Tags = @('Kommunalt', 'Skole'); Goals = @(15, 13); Location = '59.78330,10.45000'
       Status = 'Sendt inn'; CwStatus = 'Sendt inn'; Name = 'Lars Vik'; Department = 'Natur og idrett'; Likes = 0; Created = 2 }
    @{ Key = 'led'; Title = 'LED-belysning i alle barnehager'; Summary = 'Byttet all lysarmatur til LED med bevegelsessensor. Strømforbruket til lys gikk ned med over halvparten.'
       Areas = @('Fremtidsrettede bygg og anlegg'); Tags = @('Barnehage'); Goals = @(7)
       Status = 'Suksess'; CwStatus = 'Godtatt'; Name = 'Eva Lund'; Department = 'Eiendom'; Likes = 33; Created = 900; IsPast = $true }
    @{ Key = 'bil'; Title = 'Bildeling mellom virksomhetene'; Summary = 'Felles bookingløsning for kommunens elbiler, så færre biler står ubrukt store deler av dagen.'
       Challenges = 'Mange tjenestebiler brukes under to timer om dagen.'; Amount = 150000
       Areas = @('Grønn mobilitet', 'Endring, ledelse og kommunikasjon'); Tags = @('Kommunalt'); Goals = @(11, 12); InspiredBy = @('sykkel')
       Status = 'Publisert'; CwStatus = 'Løftes til linja'; Name = 'Ingrid Moe'; Department = 'Helse og omsorg'; Likes = 9; Created = 20 }
    @{ Key = 'reparasjon'; Title = 'Reparasjonskafé på biblioteket'; Summary = 'Månedlig kafé der innbyggere får hjelp til å reparere klær, sykler og småelektronikk.'
       Amount = 40000; Areas = @('Bærekraftig forbruk'); Tags = @(); Goals = @(12, 4)
       Status = 'Sendt inn'; CwStatus = 'Vurderes'; Name = 'Ola Nilsen'; Department = 'Kultur'; Likes = 0; Created = 6 }
)

$comments = @{
    'sol'        = @('Flott forslag! Har dere sjekket bæreevnen på taket?', 'Kan dette kombineres med batteri for å kutte effekttopper?')
    'mat'        = @('Elevrådet på Hovedgården er positive.', 'Vi testet dette på Nesbru og fikk gode tilbakemeldinger.')
    'sykkel'     = @('Endelig! Brukes flittig allerede.')
    'bil'        = @('Hjemmetjenesten har behov på kveldstid. Går det an å reservere faste tider?')
    'reparasjon' = @('Frivilligsentralen vil gjerne være med.')
}

$evaluations = @{
    'sol'        = @{ F = 4; E = 5; D = 3; I = 2; Actors = $true; Law = $false; Comment = 'Solid, men dyrt. Bør se på leasing.' }
    'mat'        = @{ F = 5; E = 3; D = 5; I = 3; Actors = $false; Law = $false; Comment = 'Lett å spre til alle skoler.' }
    'bil'        = @{ F = 3; E = 4; D = 4; I = 3; Actors = $true; Law = $false; Comment = 'Krever avklaring med HR om kjørebok.' }
    'reparasjon' = @{ F = 5; E = 2; D = 3; I = 4; Actors = $true; Law = $false; Comment = $null }
}

$ids = @{}
$created = 0
foreach ($s in $demo) {
    $match = $existing | Where-Object { $_['Title'] -eq $s.Title } | Select-Object -First 1
    if ($match) { $ids[$s.Key] = $match.Id; Write-Host "Finnes allerede: $($s.Title)"; continue }

    $values = @{
        Title                  = $s.Title
        KmiSummary             = $s.Summary
        KmiUsefulnessType      = $s.Areas
        KmiTags                = $s.Tags
        KmiStatus              = $s.Status
        KmiCaseWorkerStatus    = $s.CwStatus
        KmiName                = $s.Name
        KmiDepartment          = $s.Department
        KmiLikes               = $s.Likes
        KmiNumberOfComments    = @($comments[$s.Key]).Where({ $_ }).Count
        KmiIsPast              = [bool]$s.IsPast
        KmiCompRef             = $DemoRef
        KmiSustainabilityGoals = @($s.Goals | ForEach-Object { $goals[$_] } | Where-Object { $_ })
    }
    if ($s.Challenges) { $values.KmiChallenges = $s.Challenges }
    if ($s.Amount) { $values.KmiAmount = $s.Amount }
    if ($s.Location) { $values.KmiLocation = $s.Location }
    if ($s.Monthly) {
        $values.KmiMonthlyStartDate = DaysAgo 5
        $values.KmiMonthlyEndDate = $today.AddDays(25)
    }

    $item = Add-PnPListItem -List $SuggestionList -Values $values
    $ids[$s.Key] = $item.Id
    $created++
    Write-Host "Opprettet: $($s.Title)" -ForegroundColor Green

    # Opprettet-dato bakover i tid, så sortering og periodefilter blir realistiske.
    try {
        Set-PnPListItem -List $SuggestionList -Identity $item.Id -UpdateType UpdateOverwriteVersion -Values @{ Created = (DaysAgo $s.Created) } | Out-Null
    }
    catch { Write-Warning "Kunne ikke sette opprettet-dato på '$($s.Title)': $($_.Exception.Message)" }
}

# Inspirert av (etter at alle har fått id)
foreach ($s in $demo | Where-Object { $_.InspiredBy }) {
    $refs = @($s.InspiredBy | ForEach-Object { $ids[$_] } | Where-Object { $_ })
    if ($refs.Count) { Set-PnPListItem -List $SuggestionList -Identity $ids[$s.Key] -Values @{ KmiInspiredBy = $refs } | Out-Null }
}

if ($created -eq 0) { Write-Host 'Ingen nye forslag. Kommentarer og vurderinger hoppes over.'; return }

# Kommentarer
foreach ($key in $comments.Keys) {
    if (-not $ids[$key]) { continue }
    foreach ($text in $comments[$key]) {
        Add-PnPListItem -List $CommentList -Values @{ Title = $text.Substring(0, [Math]::Min(200, $text.Length)); KmiText = $text; KmiSuggestion = $ids[$key] } | Out-Null
    }
}
Write-Host 'Kommentarer lagt inn.' -ForegroundColor Green

# Vurderinger
foreach ($key in $evaluations.Keys) {
    if (-not $ids[$key]) { continue }
    $e = $evaluations[$key]
    $values = @{
        Title                         = "Vurdering $($ids[$key])"
        KmiSuggestion                 = $ids[$key]
        KmiScoreFeasability           = $e.F
        KmiScoreUserInvolvement       = $e.E
        KmiScoreDistributionPotential = $e.D
        KmiScoreDegreeOfInnovation    = $e.I
        KmiMoreActors                 = $e.Actors
        KmiLawRequirements            = $e.Law
    }
    if ($e.Comment) { $values.KmiShortComment = $e.Comment }
    Add-PnPListItem -List $EvaluationList -Values $values | Out-Null
}
Write-Host 'Vurderinger lagt inn.' -ForegroundColor Green

Write-Host ''
Write-Host "Ferdig: $created forslag. Fjern igjen med -Remove." -ForegroundColor Green
