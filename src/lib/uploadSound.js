// scripts/uploadSounds.js
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// env vars:
//   SUPABASE_URL=https://<your>.supabase.co
//   SUPABASE_SERVICE_KEY=<service_role_key>
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

const audioExts = ['.mp3', '.wav', '.aac', '.ogg'];
const imageExts = ['.jpg', '.jpeg', '.png', '.webp'];

async function main() {
    const baseDir = path.resolve(__dirname, '../sounds');
    const entries = fs.readdirSync(baseDir);

    // map from baseName -> { audioKey?, imageKey? }
    const recordsMap = {};

    // 1) Upload all files and populate recordsMap
    for (const name of entries) {
        const fullPath = path.join(baseDir, name);
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) continue;
        const ext = path.extname(name).toLowerCase();
        const base = path.basename(name, ext);

        let bucket;
        if (audioExts.includes(ext)) bucket = 'audio-files';
        else if (imageExts.includes(ext)) bucket = 'images';
        else continue;

        const key = name; // or use subfolders: path.relative(baseDir, fullPath)
        console.log(`Uploading ${name} → ${bucket}/${key}`);
        const { error } = await supabase
            .storage
            .from(bucket)
            .upload(key, fs.createReadStream(fullPath), { upsert: false });
        if (error) {
            console.error(`Failed: ${error.message}`);
            continue;
        }

        // get the public URL
        const { publicURL } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(key);

        // track
        recordsMap[base] = recordsMap[base] || {};
        if (bucket === 'audio-files') recordsMap[base].audio_url = publicURL;
        else if (bucket === 'images') recordsMap[base].background_image_url = publicURL;
    }

    // 2) Build an array of inserts
    const toInsert = Object.entries(recordsMap)
        .filter(([_, rec]) => rec.audio_url) // we need at least audio
        .map(([base, rec]) => ({
            title: base.replace(/[-_]/g, ' '),  // e.g. "morning-birds" → "morning birds"
            audio_url: rec.audio_url,
            background_image_url: rec.background_image_url || null,
            is_premium: false,
            tags: [],    // or add defaults
        }));

    if (toInsert.length === 0) {
        console.log('No new records to insert.');
        return;
    }

    // 3) Insert into sounds table
    console.log(`Inserting ${toInsert.length} rows into public.sounds…`);
    const { data, error } = await supabase
        .from('sounds')
        .upsert(toInsert, { onConflict: 'audio_url' }); // or .insert(...)
    if (error) {
        console.error('Error inserting into sounds table:', error.message);
    } else {
        console.log('Upserted records:', data.length);
    }
}

main().catch(console.error);
