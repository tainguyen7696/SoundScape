// scripts/uploadSounds.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from './supabaseConfig.js';

// ─── Polyfill __dirname for ES modules ────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ──────────────────────────────────────────────────────────

// Configuration
const BUCKET_AUDIO = 'audio-files';
const BUCKET_IMAGE = 'images';
const TABLE_NAME = 'sounds';
const SOUNDS_DIR = path.resolve(__dirname, 'sounds');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadPair(baseName) {
    const toUpload = [
        { ext: '.mp3', bucket: BUCKET_AUDIO, storagePath: `sounds/${baseName}.mp3` },
        { ext: '.png', bucket: BUCKET_IMAGE, storagePath: `${baseName}.png` }
    ];

    for (const { ext, bucket, storagePath } of toUpload) {
        const filePath = path.join(SOUNDS_DIR, baseName + ext);
        if (!fs.existsSync(filePath)) {
            console.warn(`Skipping missing file: ${filePath}`);
            continue;
        }
        const file = fs.readFileSync(filePath);
        console.log(`Uploading ${filePath} → ${bucket}/${storagePath}`);
        const { error: upErr } = await supabase
            .storage
            .from(bucket)
            .upload(storagePath, file, { upsert: true });

        if (upErr) {
            console.error(`Upload error for ${bucket}/${storagePath}:`, upErr.message);
            return null;
        }
    }

    // get public URLs
    const { data: { publicUrl: audio_url } } = supabase
        .storage.from(BUCKET_AUDIO)
        .getPublicUrl(`sounds/${baseName}.mp3`);
    const { data: { publicUrl: background_image_url } } = supabase
        .storage.from(BUCKET_IMAGE)
        .getPublicUrl(`${baseName}.png`);

    return { audio_url, background_image_url };
}

async function replaceRecord(baseName, urls) {
    const record = {
        title: baseName,
        description: '',
        audio_url: urls.audio_url,
        background_image_url: urls.background_image_url,
        tags: [],
        is_premium: false,
        created_at: new Date().toISOString()
    };

    // 1) delete existing by title
    const { error: delErr } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('title', baseName);
    if (delErr) {
        console.error(`❌ Failed to delete existing "${baseName}":`, delErr.message);
        return;
    }

    // 2) insert fresh record
    const { error: insErr } = await supabase
        .from(TABLE_NAME)
        .insert(record);

    if (insErr) {
        console.error(`❌ Insert error for "${baseName}":`, insErr.message);
    } else {
        console.log(`✅ Replaced record for "${baseName}"`);
    }
}

(async () => {
    try {
        if (!fs.existsSync(SOUNDS_DIR)) {
            throw new Error(`Sounds directory not found: ${SOUNDS_DIR}`);
        }

        // collect base names
        const files = fs.readdirSync(SOUNDS_DIR);
        const baseNames = Array.from(new Set(
            files.filter(f => /\.(mp3|png)$/i.test(f))
                .map(f => path.parse(f).name)
        ));

        if (!baseNames.length) {
            console.log(`No .mp3 or .png files found in ${SOUNDS_DIR}`);
            return;
        }

        for (const baseName of baseNames) {
            const urls = await uploadPair(baseName);
            if (!urls) continue;
            await replaceRecord(baseName, urls);
        }

        console.log('\n*** All done! ***');
    } catch (err) {
        console.error('Fatal error:', err.message || err);
        process.exit(1);
    }
})();
