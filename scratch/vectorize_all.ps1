$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ampwdHVobnF1b2Jqb2h1bnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExNTMzMywiZXhwIjoyMDg2NjkxMzMzfQ.PtZWoCXkBe2g81R6mLgjIvVIskB3o8E0Z0gLkJuJGsU"
$url = "https://uxjjptuhnquobjohunqs.supabase.co/functions/v1/generate-embeddings"

for ($i = 1; $i -le 1403; $i++) {
    Write-Host "Processing tour #$i..."
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{ 
            "Authorization" = "Bearer $serviceRoleKey"
            "Content-Type" = "application/json"
        }
        if ($response) {
            Write-Output ($response | ConvertTo-Json -Depth 10)
        }
    } catch {
        # Check if it's just a 500 which might mean 'nothing left' or a transient error
        Write-Warning "Error at tour #$i : $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 1
}
