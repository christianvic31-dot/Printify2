param([string]$RepositoryPath = "")
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$owner = 'christianvic31-dot/Printify'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git for Windows is required: https://git-scm.com/download/win' }
if (-not $RepositoryPath) { $RepositoryPath = Join-Path $root 'Printify' }
if (-not (Test-Path $RepositoryPath)) {
  & git clone "https://github.com/$owner.git" $RepositoryPath
  if ($LASTEXITCODE -ne 0) { throw 'Git clone failed. Check GitHub connection and permissions.' }
}
if (-not (Test-Path (Join-Path $RepositoryPath '.git'))) { throw 'The selected folder is not a Git repository.' }
Push-Location $RepositoryPath
try {
  $remote = (& git remote get-url origin 2>$null)
  if ($LASTEXITCODE -ne 0 -or $remote -notmatch 'christianvic31-dot[/\\]Printify(\.git)?$') { throw "Unexpected repository remote: $remote" }
  $branch = (& git branch --show-current).Trim()
  if ($branch -ne 'main') { throw "Expected 'main' branch, got '$branch'. Checkout main first." }
  $dirty = & git status --porcelain
  if ($dirty) { throw 'Uncommitted changes exist. Commit or stash them before running this script.' }
  & git pull --ff-only origin main
  if ($LASTEXITCODE -ne 0) { throw 'Cannot fast-forward. Resolve branch before updating.' }
  $target = Join-Path $RepositoryPath 'Frontend'
  $backup = Join-Path $root ("Frontend_backup_" + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.zip')
  if (Test-Path $target) { Compress-Archive -Path $target -DestinationPath $backup -Force; Write-Host "Backup: $backup" }
  $source = Join-Path $root 'Frontend'
  if (-not (Test-Path $source)) { throw 'Bundled Frontend directory is missing.' }
  $preserve = @('login.html','js/login.js','css/style.css')
  $count = 0
  Get-ChildItem $source -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($source.Length + 1).Replace('\','/')
    if ($preserve -contains $relative) { Write-Host "Preserved original: $relative"; return }
    $destination = Join-Path $target $relative
    $dir = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
    $count++
  }
  Write-Host "Copied $count UI files. Existing login and backend untouched."
  & git add -- Frontend
  & git diff --cached --check
  if ($LASTEXITCODE -ne 0) { throw 'Git found whitespace issues. Review git diff --cached.' }
  & git diff --cached --stat
  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) { Write-Host 'Already up to date; nothing to push.'; return }
  $answer = Read-Host 'Push these Frontend changes to GitHub main? Type YES to continue'
  if ($answer -cne 'YES') { Write-Host 'Not pushed. Review changes using git diff --cached'; return }
  & git commit -m 'Sync Admin and Staff UI from Printify_Main(final) including themes and breadcrumbs'
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
  & git push origin main
  if ($LASTEXITCODE -ne 0) { throw 'Push failed. Commit remains local; check GitHub permissions.' }
  Write-Host 'SUCCESS: Frontend updated on GitHub main.'
} finally { Pop-Location }
