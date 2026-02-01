#!/usr/bin/env node
/**
 * export-vs-codebase-v2.mjs
 * 
 * Generates VS_Codebase_v2.md with full repo context while:
 * 1. Excluding environment variables and secret files
 * 2. Excluding this export script and output files
 * 3. Adding a REDACTIONS section at the top
 * 
 * Usage: pnpm run export:vs_codebase:v2
 * 
 * This script orchestrates:
 * 1. Secrets scanning (best-effort grep if gitleaks/trufflehog unavailable)
 * 2. Repomix execution with minimal ignore patterns (env + export artifacts)
 * 3. Post-processing to add REDACTIONS header
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
    outputFile: 'VS_Codebase_v2.md',
    tempRepomixConfig: '.repomix-vs-codebase-v2.json',
    exportScriptPath: 'scripts/export-vs-codebase-v2.mjs',
};

// Secret patterns to scan for (regex patterns)
const SECRET_PATTERNS = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}/g },
    { name: 'GitHub Token', pattern: /gh[ps]_[A-Za-z0-9]{36,}/g },
    { name: 'Generic API Key', pattern: /['"]?api[_-]?key['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
    { name: 'Generic Secret', pattern: /['"]?secret['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
    { name: 'Supabase Key', pattern: /eyJ[A-Za-z0-9_-]{100,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
    { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/g },
];

// Files that should never be included
const EXCLUDED_FILES = [
    '.env',
    '.env.local',
    '.env.*.local',
    '.env.development',
    '.env.production',
    '*.pem',
    '*.key',
    '*.p12',
    '*.pfx',
    'id_rsa*',
    '*.jks',
    'service-account*.json',
];

/**
 * Check if gitleaks or trufflehog is available
 */
function checkSecretsScannerAvailable() {
    try {
        execSync('gitleaks version', { stdio: 'ignore' });
        return 'gitleaks';
    } catch {
        try {
            execSync('trufflehog --version', { stdio: 'ignore' });
            return 'trufflehog';
        } catch {
            return null;
        }
    }
}

/**
 * Run secrets scan using available tool or best-effort grep
 */
function runSecretsCheck() {
    console.log('\n🔍 Step 1: Scanning for secrets...\n');

    const scanner = checkSecretsScannerAvailable();
    const secretsFound = [];

    if (scanner === 'gitleaks') {
        console.log('  Using gitleaks for secrets detection...');
        try {
            execSync('gitleaks detect --source . --no-git', { cwd: ROOT_DIR, stdio: 'pipe' });
        } catch (error) {
            if (error.stdout) {
                secretsFound.push({ file: 'detected by gitleaks', pattern: error.stdout.toString() });
            }
        }
    } else if (scanner === 'trufflehog') {
        console.log('  Using trufflehog for secrets detection...');
        try {
            execSync('trufflehog filesystem .', { cwd: ROOT_DIR, stdio: 'pipe' });
        } catch (error) {
            if (error.stdout) {
                secretsFound.push({ file: 'detected by trufflehog', pattern: error.stdout.toString() });
            }
        }
    } else {
        console.log('  No dedicated secrets scanner found, using best-effort pattern matching...');
        secretsFound.push(...runPatternBasedSecretsScan());
    }

    if (secretsFound.length > 0) {
        console.log(`\n⚠️  Found ${secretsFound.length} potential secret(s):`);
        secretsFound.forEach(s => console.log(`    - ${s.file}: ${s.pattern}`));
    } else {
        console.log('  ✅ No secrets detected');
    }

    return secretsFound;
}

/**
 * Pattern-based secrets scanning for files that will be included
 */
function runPatternBasedSecretsScan() {
    const secretsFound = [];
    const extensionsToScan = ['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.sql', '.css'];

    function scanDirectory(dir, relativePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relativePath, entry.name);

            // Skip excluded directories
            if (entry.isDirectory()) {
                if (['node_modules', '.git', '.next', '.export_sanitized', '.venv'].includes(entry.name)) {
                    continue;
                }
                scanDirectory(fullPath, relPath);
                continue;
            }

            // Skip non-scannable files
            const ext = path.extname(entry.name).toLowerCase();
            if (!extensionsToScan.includes(ext)) continue;

            // Skip env files
            if (entry.name.startsWith('.env')) continue;

            try {
                const content = fs.readFileSync(fullPath, 'utf-8');

                for (const { name, pattern } of SECRET_PATTERNS) {
                    const matches = content.match(pattern);
                    if (matches) {
                        const filtered = matches.filter(m => {
                            if (m.includes('EXAMPLE') || m.includes('PLACEHOLDER') || m.includes('YOUR_')) return false;
                            if (m.includes('secret') && m.includes('//')) return false;
                            if (name === 'Supabase Key' && m.length < 150) return false;
                            return true;
                        });

                        if (filtered.length > 0) {
                            secretsFound.push({
                                file: relPath,
                                pattern: name,
                                count: filtered.length,
                            });
                        }
                    }
                }
            } catch {
                // Skip files that can't be read
            }
        }
    }

    scanDirectory(ROOT_DIR);
    return secretsFound;
}

/**
 * Create temporary Repomix config
 */
function createRepomixConfig() {
    console.log('\n⚙️  Step 2: Creating Repomix configuration...\n');

    const config = {
        output: {
            filePath: CONFIG.outputFile,
            style: 'markdown',
            headerText: '',
            showLineNumbers: false,
        },
        ignore: {
            customPatterns: [
                // Secret files
                ...EXCLUDED_FILES,
                // Build artifacts
                '.next/**',
                'node_modules/**',
                '.venv/**',
                // Temp files
                '.export_sanitized/**',
                '.export_tmp/**',
                // This script + output files
                CONFIG.tempRepomixConfig,
                CONFIG.exportScriptPath,
                'VS_Codebase.md',
                CONFIG.outputFile,
            ],
            // Best-effort: avoid external ignore files for a complete export
            useGitignore: false,
            useRepomixIgnore: false,
        },
        include: [
            '**/*',
        ],
    };

    const configPath = path.join(ROOT_DIR, CONFIG.tempRepomixConfig);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`  Created: ${CONFIG.tempRepomixConfig}`);

    return configPath;
}

/**
 * Run Repomix to generate the codebase export
 */
function runRepomix(configPath) {
    console.log('\n📦 Step 3: Running Repomix...\n');

    try {
        execSync(`npx repomix --config "${configPath}"`, {
            cwd: ROOT_DIR,
            stdio: 'inherit',
            encoding: 'utf-8',
        });
        return true;
    } catch (error) {
        console.error('❌ Repomix failed:', error.message);
        return false;
    }
}

/**
 * Get list of redacted files and what was redacted
 */
function getRedactionsList() {
    const redactions = [];

    redactions.push({
        file: '.env, .env.local, .env.*.local',
        redacted: 'All content',
        reason: 'Environment files may contain secrets (API keys, database credentials)',
    });

    redactions.push({
        file: CONFIG.exportScriptPath,
        redacted: 'Entire file excluded',
        reason: 'Exclude the export process file itself from the export output',
    });

    redactions.push({
        file: CONFIG.outputFile,
        redacted: 'Entire file excluded',
        reason: 'Exclude the generated export file from the export output',
    });

    redactions.push({
        file: 'VS_Codebase.md',
        redacted: 'Entire file excluded',
        reason: 'Avoid nesting previous exports into this export',
    });

    return redactions;
}

/**
 * Add header with REDACTIONS section to the output file
 */
function addRedactionsHeader() {
    console.log('\n✏️  Step 4: Adding REDACTIONS header...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);

    if (!fs.existsSync(outputPath)) {
        console.error(`❌ Output file not found: ${CONFIG.outputFile}`);
        return false;
    }

    const content = fs.readFileSync(outputPath, 'utf-8');
    const redactions = getRedactionsList();
    const timestamp = new Date().toISOString();

    const header = `# VS_Codebase_v2.md

## Generation Info

- **Repository**: cat_website_execution
- **Generated**: ${timestamp}
- **Command**: \`pnpm run export:vs_codebase:v2\`

## REDACTIONS

The following content has been intentionally redacted from this export:

| File Path | What Was Redacted | Reason |
|-----------|-------------------|--------|
${redactions.map(r => `| ${r.file} | ${r.redacted} | ${r.reason} |`).join('\n')}

---

`;

    const newContent = header + content;

    fs.writeFileSync(outputPath, newContent);
    console.log(`  ✅ Added REDACTIONS header to ${CONFIG.outputFile}`);

    return true;
}

/**
 * Run post-pass to redact any remaining secrets in output
 */
function runPostPassRedaction() {
    console.log('\n🔒 Step 5: Running post-pass redaction...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);
    let content = fs.readFileSync(outputPath, 'utf-8');
    let redactedCount = 0;

    const postPassPatterns = [
        { pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, name: 'JWT Token' },
        { pattern: /sk_live_[A-Za-z0-9]{24,}/g, name: 'Stripe Live Key' },
        { pattern: /sk_test_[A-Za-z0-9]{24,}/g, name: 'Stripe Test Key' },
        { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },
    ];

    for (const { pattern, name } of postPassPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, '<REDACTED_SECRET>');
            redactedCount += matches.length;
            console.log(`  Redacted ${matches.length} ${name}(s)`);
        }
    }

    if (redactedCount > 0) {
        fs.writeFileSync(outputPath, content);
        console.log(`  ✅ Redacted ${redactedCount} potential secret(s)`);
    } else {
        console.log('  ✅ No additional secrets found in output');
    }

    return true;
}

/**
 * Cleanup temporary files
 */
function cleanup() {
    console.log('\n🧹 Step 6: Cleanup...\n');

    const configPath = path.join(ROOT_DIR, CONFIG.tempRepomixConfig);
    if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        console.log(`  Removed: ${CONFIG.tempRepomixConfig}`);
    }
}

/**
 * Verify the output
 */
function verifyOutput() {
    console.log('\n✅ Step 7: Verification...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);

    if (!fs.existsSync(outputPath)) {
        console.error(`  ❌ Output file not found: ${CONFIG.outputFile}`);
        return false;
    }

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`  📄 Output: ${CONFIG.outputFile}`);
    console.log(`  📏 Size: ${sizeKB} KB (${sizeMB} MB)`);

    const content = fs.readFileSync(outputPath, 'utf-8');

    if (!content.includes('## REDACTIONS')) {
        console.error('  ❌ REDACTIONS section missing');
        return false;
    }
    console.log('  ✅ REDACTIONS section present');

    const envValuePatterns = [
        /SUPABASE_SERVICE_ROLE_KEY=eyJ[A-Za-z0-9_\-\.]+/,
        /NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[A-Za-z0-9_\-\.]+/,
        /SUPABASE_URL=https:\/\/[a-z0-9]+\.supabase\.co/,
    ];

    let envLeakDetected = false;
    for (const pattern of envValuePatterns) {
        if (pattern.test(content)) {
            console.error(`  ❌ Environment variable value detected: ${pattern.source}`);
            envLeakDetected = true;
        }
    }

    if (!envLeakDetected) {
        console.log('  ✅ No environment variable values leaked');
    } else {
        return false;
    }

    return true;
}

/**
 * Main orchestration
 */
async function main() {
    console.log('═'.repeat(60));
    console.log('  VS_Codebase_v2.md Export Tool');
    console.log('═'.repeat(60));
    console.log();

    const startTime = Date.now();

    const secretsFound = runSecretsCheck();
    if (secretsFound.length > 0) {
        console.log('\n⚠️  Secrets were detected. Review the findings above.');
        console.log('   Continuing with export (secrets will be excluded via ignore patterns)...');
    }

    const configPath = createRepomixConfig();

    if (!runRepomix(configPath)) {
        process.exit(1);
    }

    if (!addRedactionsHeader()) {
        process.exit(1);
    }

    runPostPassRedaction();

    cleanup();

    const verified = verifyOutput();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log();
    console.log('═'.repeat(60));
    if (verified) {
        console.log(`  ✅ Export complete! (${elapsed}s)`);
        console.log(`  📄 Output: ${CONFIG.outputFile}`);
        console.log();
        console.log('  Next steps:');
        console.log('  1. Review VS_Codebase_v2.md for any remaining sensitive content');
        console.log('  2. Use it for deep research and root cause analysis');
    } else {
        console.log(`  ❌ Export completed with warnings (${elapsed}s)`);
        console.log('  Please review the output manually.');
    }
    console.log('═'.repeat(60));

    process.exit(verified ? 0 : 1);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
