#!/usr/bin/env node

/**
 * Bundle Budget Checker
 * Analyzes bundle size and enforces size limits
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const BUDGET_MB = 1.5; // 1.5 MB budget
const BUILD_DIR = '.next';

function getBundleSize() {
  try {
    // Run build if not already built
    console.log('Building application...');
    execSync('pnpm build', { stdio: 'inherit' });

    // Analyze bundle size (simplified - in real implementation you'd use source-map-explorer)
    const stats = execSync('find .next -name "*.js" -exec du -bc {} + | tail -1', { encoding: 'utf8' });
    const sizeBytes = parseInt(stats.split('\t')[0]);
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