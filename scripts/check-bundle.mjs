#!/usr/bin/env node

/**
 * Bundle Budget Checker
 * Analyzes bundle size and enforces size limits
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const BUDGET_MB = 10; // 10 MB budget (total .next JS files; First Load JS per route is ~100-150 KB)

/**
 * Recursively sum sizes of all .js files under a directory.
 * Works cross-platform (no Unix `find`/`du`/`tail` needed).
 */
function sumJsBytes(dir) {
  let total = 0;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += sumJsBytes(full);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      total += statSync(full).size;
    }
  }
  return total;
}

function getBundleSize() {
  try {
    // Run build if not already built
    console.log('Building application...');
    execSync('pnpm build', { stdio: 'inherit' });

    // Cross-platform bundle analysis – only count client-side JS in .next/static
    const sizeBytes = sumJsBytes('.next/static');
    const sizeMB = sizeBytes / (1024 * 1024);

    return sizeMB;
  } catch (error) {
    console.error('Error analyzing bundle:', error.message);
    return null;
  }
}

function checkBundleBudget() {
  const bundleSize = getBundleSize();

  if (bundleSize === null) {
    console.error('❌ Bundle analysis failed');
    process.exit(1);
  }

  console.log(`📦 Bundle size: ${bundleSize.toFixed(2)} MB`);
  console.log(`🎯 Budget: ${BUDGET_MB} MB`);

  if (bundleSize > BUDGET_MB) {
    console.error(`❌ Bundle budget exceeded by ${(bundleSize - BUDGET_MB).toFixed(2)} MB`);
    process.exit(1);
  } else {
    console.log(`✅ Bundle budget passed (${(BUDGET_MB - bundleSize).toFixed(2)} MB remaining)`);
  }
}

// Run the check
checkBundleBudget();