$ErrorActionPreference = "Stop"

$projectRef = "rxvhtqdepihoqsexvjbs"

if ($env:SUPABASE_DB_URL) {
  Write-Host "Applying Prihika recovery migration through SUPABASE_DB_URL..."
  npx supabase db push --db-url $env:SUPABASE_DB_URL --include-all --yes
  exit $LASTEXITCODE
}

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  throw "SUPABASE_ACCESS_TOKEN is required when SUPABASE_DB_URL is not set."
}

if (-not $env:SUPABASE_DB_PASSWORD) {
  throw "SUPABASE_DB_PASSWORD is required when using project linking."
}

Write-Host "Linking Supabase project $projectRef..."
npx supabase link --project-ref $projectRef --password $env:SUPABASE_DB_PASSWORD --yes

Write-Host "Pushing all unapplied migrations, including complete database recovery..."
npx supabase db push --linked --password $env:SUPABASE_DB_PASSWORD --include-all --yes
