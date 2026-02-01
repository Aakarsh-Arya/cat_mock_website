#!/usr/bin/env node

/**
 * Blueprint Guard Script
 * Ensures that blueprint anchors are present in code and docs are up to date
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const BLUEPRINT_FILE = 'docs/BLUEPRINT.md';
const SRC_DIR = 'src';

// Extract anchors from blueprint
function extractAnchors(blueprintContent) {
  const anchorRegex = /## (.+?) \((\w+-\d+)\)/g;
  const anchors = new Set();
  let match;

  while ((match = anchorRegex.exec(blueprintContent)) !== null) {
    anchors.add(match[2]); // Capture the anchor ID
  }

  return anchors;
}

// Find anchor references in code
function findAnchorReferences(dir, anchors) {
  const foundAnchors = new Set();

  function scanDirectory(currentDir) {
    const items = readdirSync(currentDir);

    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(item))) {
        const content = readFileSync(fullPath, 'utf8');
        for (const anchor of anchors) {
          if (content.includes(anchor)) {
            foundAnchors.add(anchor);
          }
        }
      }
    }
  }

  scanDirectory(dir);
  return foundAnchors;
}

// Main check
try {
  const blueprintContent = readFileSync(BLUEPRINT_FILE, 'utf8');
  const blueprintAnchors = extractAnchors(blueprintContent);
  const foundAnchors = findAnchorReferences(SRC_DIR, blueprintAnchors);

  const missingAnchors = [...blueprintAnchors].filter(anchor => !foundAnchors.has(anchor));

  if (missingAnchors.length > 0) {
    console.error('❌ Blueprint Guard Failed: Missing anchor references in code:');
    missingAnchors.forEach(anchor => console.error(`  - ${anchor}`));
    process.exit(1);
  } else {
    console.log('✅ Blueprint Guard Passed: All anchors referenced in code');
  }
} catch (error) {
  console.error('❌ Blueprint Guard Error:', error.message);
  process.exit(1);
}