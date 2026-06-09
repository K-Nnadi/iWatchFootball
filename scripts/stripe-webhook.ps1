# Forward Stripe test-mode webhooks to the local Nest API.
# Prerequisites:
#   1. Stripe CLI installed (winget install Stripe.StripeCli)
#   2. stripe login  OR  STRIPE_SECRET_KEY in backend/.env
#   3. Backend running on port 8080

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot "backend\.env"
$forwardUrl = "localhost:8080/webhooks/stripe"
$events = @(
    "checkout.session.completed",
    "checkout.session.expired",
    "customer.subscription.updated",
    "customer.subscription.deleted"
) -join ","

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
    Write-Host "No Stripe API key found." -ForegroundColor Yellow
    Write-Host "Either:"
    Write-Host "  - Add STRIPE_SECRET_KEY=sk_test_... to backend/.env"
    Write-Host "  - Or run: stripe login"
    exit 1
}

Write-Host ""
Write-Host "=== Stripe webhook forwarder ===" -ForegroundColor Cyan
Write-Host "Target: http://$forwardUrl"
Write-Host "Events: $events"
Write-Host ""
Write-Host "Copy the whsec_... secret printed below into backend/.env:" -ForegroundColor Yellow
Write-Host "  STRIPE_WEBHOOK_SECRET=whsec_..."
Write-Host "Then restart the backend so StripeConfigBootstrap syncs it to integration.config."
Write-Host ""

& stripe listen `
    --api-key $apiKey `
    --forward-to $forwardUrl `
    --events $events `
    --skip-verify
