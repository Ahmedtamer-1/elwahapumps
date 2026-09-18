<#
  Packages the site for upload to cPanel's "Setup Node.js App".

  Produces, in ./deploy:
    elwaha-app.zip  - every file git tracks at HEAD. That leaves out .env,
                      the database, node_modules, .next and stray untracked
                      files. Extract it into the app root on the server.
    prod.db         - a consistent snapshot of the local database, made with
                      SQLite's VACUUM INTO (scripts/backup-db.ts), not a file
                      copy. Upload it to ~/elwaha-data/prod.db.

  node_modules is never shipped: better-sqlite3 and sharp are native, and
  the Windows builds do not run on the Linux server. "Run NPM Install" on
  the server fetches the right ones.

  Usage (from the project root):
    powershell -ExecutionPolicy Bypass -File scripts/make-deploy-zip.ps1
#>
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

# git archive packs HEAD, not the working tree. Uncommitted edits would be
# silently missing from the upload, so refuse rather than ship a surprise.
$dirty = git status --porcelain --untracked-files=no
if ($dirty) {
  Write-Error "Uncommitted changes to tracked files. Commit them first, since the zip is built from HEAD:`n$dirty"
}

$out = "deploy"
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory $out | Out-Null

git archive --format=zip -o "$out/elwaha-app.zip" HEAD
if ($LASTEXITCODE -ne 0) { Write-Error "git archive failed" }

npx tsx scripts/backup-db.ts "--out=$out" --keep=1
if ($LASTEXITCODE -ne 0) { Write-Error "database snapshot failed" }
Get-ChildItem "$out/elwaha-*.db" | Select-Object -First 1 | Rename-Item -NewName "prod.db"

$commit = git rev-parse --short HEAD
Write-Host ""
Write-Host "Ready in ./$out (commit $commit):"
Get-ChildItem $out | ForEach-Object { "  {0,-16} {1,8:N1} MB" -f $_.Name, ($_.Length / 1MB) }
