$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ampwdHVobnF1b2Jqb2h1bnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExNTMzMywiZXhwIjoyMDg2NjkxMzMzfQ.PtZWoCXkBe2g81R6mLgjIvVIskB3o8E0Z0gLkJuJGsU"
$url = "https://uxjjptuhnquobjohunqs.supabase.co/functions/v1/generate-embeddings?limit=50"

for ($i = 1; $i -le 30; $i++) {
    Write-Host "Processing batch $i..."
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{ "Authorization" = "Bearer $serviceRoleKey" }
        Write-Output ($response | ConvertTo-Json -Depth 10)
    } catch {
        Write-Error "Error in batch $i : $($_.Exception.Message)"
    }
    Write-Host "Batch $i complete."
    Start-Sleep -Seconds 2
}
