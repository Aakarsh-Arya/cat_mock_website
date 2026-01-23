@echo off
REM God Mode: Complete codebase export for Gemini
REM Creates clean, lossless, ready-to-paste context chunks

echo 🚀 Starting God Mode export...

REM Clean up any existing files
echo 🧹 Cleaning up old files...
del /Q repomix-output* 2>nul
del /Q gemini_*.md 2>nul

REM Generate complete codebase export in Markdown format
echo 📦 Running repomix...
npx repomix --style markdown --split-output 900kb --ignore "node_modules/**,.next/**,dist/**,build/**,.git/**"

REM Rename the split files to gemini_XX.md format
echo 📋 Renaming chunks...
move repomix-output.1.md gemini_01.md >nul 2>&1
move repomix-output.2.md gemini_02.md >nul 2>&1
move repomix-output.3.md gemini_03.md >nul 2>&1
move repomix-output.4.md gemini_04.md >nul 2>&1
move repomix-output.5.md gemini_05.md >nul 2>&1

echo ✅ God Mode complete! Files ready:
for %%f in (gemini_*.md) do echo   %%~nf%%~xf

echo.
echo 🎯 Usage: Paste gemini_01.md, gemini_02.md, etc. into Gemini
echo 💡 Each chunk is ~900KB - perfect for Gemini's context window
echo 🔄 Run again anytime: .\export_for_gemini.bat

pause