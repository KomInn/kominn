Write-Host "## Clearing dist... ##"
Remove-Item .\dist -Force -Recurse

Write-Host "## Creating dist/Install folder ##"
$Output = New-Item -ItemType Directory -Force -Path dist/Install

Write-Host "## Creating release folder ##"
$Output = New-Item -ItemType Directory -Force -Path release

Write-Host "## Building source ##"
$Output = webpack --env.production

Write-Host "## Copying install script to install folder ##"
$Output = Copy-Item -Path .\build\Install.ps1 -Destination .\dist\Install

Write-Host "## Converting and copying root template ##"
Convert-PnPFolderToProvisioningTemplate -Folder .\templates\root -Out .\dist\Install\root.pnp -Force

Write-Host "## Retrieving package and git information ##"
$CommitHash = (git rev-parse HEAD).Substring(0,16)
$PackageInfo = Get-Content .\package.json | ConvertFrom-Json

Write-Host "## Creating release package ##"
Add-Type -assembly "system.io.compression.filesystem"
Remove-Item "$PSScriptRoot/../release/$($PackageInfo.name).$($PackageInfo.version).$($CommitHash).zip" -ErrorAction SilentlyContinue
[io.compression.zipfile]::CreateFromDirectory("$PSScriptRoot/../dist/Install", "$PSScriptRoot/../release/$($PackageInfo.name).$($PackageInfo.version).$($CommitHash).zip") 