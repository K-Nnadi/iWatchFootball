# Print the local Stripe CLI webhook signing secret (whsec_...) for backend/.env
# Run once per machine/session before stripe-webhook.ps1, or when the secret rotates.

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot "backend\.env"

function Get-StripeSecretKeyFromEnvFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    foreach ($line in Get-Content $Path) {
        if ($line -match '^\s*STRIPE_SECRET_KEY\s*=\s*(.+)\s*$') {
            $val = $Matches[1].Trim().Trim('"').Trim("'")
            if ($val -and -not $val.StartsWith("#")) { return $val }
        }
    }
    return $null
}

$stripe = Get-Command stripe -ErrorAction SilentlyContinue
if (-not $stripe) {
    Write-Host "Stripe CLI not found. Install: winget install Stripe.StripeCli --source winget" -ForegroundColor Red
    exit 1
}

$apiKey = $env:STRIPE_SECRET_KEY
if (-not $apiKey) {
    $apiKey = Get-StripeSecretKeyFromEnvFile -Path $envFile
}
if (-not $apiKey) {
    Write-Host "Add STRIPE_SECRET_KEY=sk_test_... to backend/.env or run stripe login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Fetching webhook signing secret..." -ForegroundColor Cyan
& stripe listen --print-secret --api-key $apiKey
Write-Host ""
Write-Host "Add to backend/.env: STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Yellow
Write-Host "Restart the backend after updating."
