param (
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MavenArgs
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MvnVersion = "3.9.9"
$MvnDir = Join-Path $ScriptDir ".mvn\apache-maven-$MvnVersion"
$MvnExe = Join-Path $MvnDir "bin\mvn.cmd"

if (-not (Test-Path $MvnExe)) {
    Write-Host "Downloading Apache Maven $MvnVersion for local build..." -ForegroundColor Cyan
    $ZipPath = Join-Path $ScriptDir ".mvn\maven-$MvnVersion.zip"
    $Url = "https://archive.apache.org/dist/maven/maven-3/$MvnVersion/binaries/apache-maven-$MvnVersion-bin.zip"
    
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    (New-Object System.Net.WebClient).DownloadFile($Url, $ZipPath)
    
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath (Join-Path $ScriptDir ".mvn") -Force
    Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
}

$env:JAVA_HOME = ""
& $MvnExe @MavenArgs
exit $LASTEXITCODE
