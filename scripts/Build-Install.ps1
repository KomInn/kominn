Write-Host "## Clearing dist... ##"
Remove-Item .\dist -Force -Recurse

Write-Host "## Creating dist/Install folder ##"
New-Item -ItemType Directory -Force -Path dist/Install

Write-Host "## Creating release folder ##"
New-Item -ItemType Directory -Force -Path release

Write-Host "## Building source ##"
webpack

Write-Host "## Copying install script to install folder ##"
Copy-Item -Path .\build\Install.ps1 -Destination .\dist\Install

Write-Host "## Converting and copying root template ##"
Convert-PnPFolderToProvisioningTemplate -Folder .\templates\root -Out .\dist\Install\root.pnp -Force

Write-Host "## Retrieving package and git information ##"
$CommitHash = (git rev-parse HEAD).Substring(0,16)
$PackageInfo = Get-Content .\package.json | ConvertFrom-Json

Write-Host "## Creating release package ##"
Add-Type -assembly "system.io.compression.filesystem"
[io.compression.zipfile]::CreateFromDirectory("dist/Install", "release/$($PackageInfo.name).$($PackageInfo.version).$($CommitHash).zip") 