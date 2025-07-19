#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import plist from 'plist';

// 👇 adjust this if your Xcode target folder is named differently:
const projectName = 'Soundscape';
const plistPath = resolve(process.cwd(), 'ios', projectName, 'Info.plist');

// 1. Read & parse
let xml;
try {
    xml = readFileSync(plistPath, 'utf8');
} catch (e) {
    console.error(`❌ Cannot read ${plistPath}:`, e.message);
    process.exit(1);
}

let obj;
try {
    obj = plist.parse(xml);
} catch (e) {
    console.error('❌ Failed to parse Info.plist:', e.message);
    process.exit(1);
}

// 2. Bump CFBundleVersion
const current = parseInt(obj.CFBundleVersion, 10) || 0;
const next = current + 1;
obj.CFBundleVersion = String(next);

// 3. Write it back
const newXml = plist.build(obj);
try {
    writeFileSync(plistPath, newXml, 'utf8');
    console.log(`✅ CFBundleVersion bumped ${current} → ${next}`);
} catch (e) {
    console.error('❌ Failed to write Info.plist:', e.message);
    process.exit(1);
}
