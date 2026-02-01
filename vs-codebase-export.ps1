# God Mode: Complete codebase export for Gemini
# Creates clean, lossless, ready-to-paste context chunks

Write-Host "🚀 Starting God Mode export..." -ForegroundColor Green

# Clean up any existing files
Write-Host "🧹 Cleaning up old files..." -ForegroundColor Yellow
Remove-Item repomix-output* -ErrorAction SilentlyContinue
Remove-Item gemini_*.md -ErrorAction SilentlyContinue

# Generate complete codebase export in Markdown format
Write-Host "📦 Running repomix..." -ForegroundColor Yellow
& "npx.cmd" repomix --style markdown --split-output 900kb --ignore ".env.local,.env.*.local"

# Rename the split files to gemini_XX.md format
Write-Host "📋 Renaming chunks..." -ForegroundColor Yellow
$i = 1
Get-ChildItem repomix-output* -ErrorAction SilentlyContinue | Sort-Object Name | ForEach-Object {
    $newName = "gemini_{0:D2}.md" -f $i
    Rename-Item $_.FullName $newName -Force
    $i++
}

Write-Host "✅ God Mode complete! Files ready:" -ForegroundColor Green
$geminiFiles = Get-ChildItem gemini_*.md -ErrorAction SilentlyContinue | Sort-Object Name
if ($geminiFiles) {
    $geminiFiles | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB, 1)
        Write-Host ("  " + $_.Name + " (" + $sizeKB + " KB)") -ForegroundColor White
    }

    $totalSize = ($geminiFiles | Measure-Object -Property Length -Sum).Sum
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host ("  Total: " + $totalSizeMB + " MB across " + $geminiFiles.Count + " files") -ForegroundColor Gray
}
else {
    Write-Host "  No gemini_*.md files found! Repomix may have failed." -ForegroundColor Red
    Write-Host "  Try running manually: npx repomix --style markdown --split-output 900kb --ignore "".env.local,.env.*.local""" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Usage: Paste gemini_01.md, gemini_02.md, etc. into Gemini" -ForegroundColor Cyan
Write-Host "💡 Each chunk is ~900KB - perfect for Gemini's context window" -ForegroundColor Cyan
Write-Host "🔄 Run again anytime: .\export_for_gemini.ps1" -ForegroundColor Magenta
Get-ChildItem gemini_*.md | ForEach-Object {
    Write-Host ("  " + $_.Name + " (" + [math]::Round($_.Length / 1KB, 1) + " KB)")
}

Write-Host ""
Write-Host "🎯 Usage: Paste gemini_01.md, gemini_02.md, etc. into Gemini" -ForegroundColor Cyan
Write-Host "💡 Each chunk is ~900KB - perfect for Gemini's context window" -ForegroundColor Cyan