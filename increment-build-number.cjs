#!/usr/bin/env node

/**
 * increment-build-number.cjs
 *
 * Reads app.config.js, finds `buildNumber: "X"`, increments X by 1,
 * and writes the file back.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'app.config.js');

// Load the config file as text
let content;
try {
    content = fs.readFileSync(CONFIG_FILE, 'utf8');
} catch (err) {
    console.error(`❌ Could not read ${CONFIG_FILE}:`, err.message);
    process.exit(1);
}

// Regex to find buildNumber: "123"
const buildRegex = /buildNumber:\s*"(\d+)"/;
const match = content.match(buildRegex);

if (!match) {
    console.error('❌ Could not find `buildNumber: "..."` in app.config.js');
    process.exit(1);
}

// Parse, increment, replace
const current = parseInt(match[1], 10);
const next = current + 1;
const updated = content.replace(buildRegex, `buildNumber: "${next}"`);

// Write it back
try {
    fs.writeFileSync(CONFIG_FILE, updated, 'utf8');
    console.log(`✅ buildNumber bumped from ${current} → ${next}`);
} catch (err) {
    console.error('❌ Failed to write updated config:', err.message);
    process.exit(1);
}
