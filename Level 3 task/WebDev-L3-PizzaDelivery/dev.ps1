$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$nodeDir = Join-Path $projectRoot '.node'
$nodeExe = Join-Path $nodeDir 'node.exe'
$npmCmd = Join-Path $nodeDir 'npm.cmd'

if (-not (Test-Path -LiteralPath $nodeExe)) {
    Write-Error "Portable Node was not found at $nodeExe."
    exit 1
}

$env:PATH = "$nodeDir;$env:PATH"
Set-Location -LiteralPath $projectRoot

Write-Host "Using portable Node $(& $nodeExe -v) from $nodeDir"
& $npmCmd run dev
