import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
}

function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function fetchMetadata(videoId) {
    const cachePath = path.join(CACHE_DIR, `${videoId}_meta.json`);
    if (fs.existsSync(cachePath)) {
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }

    try {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const html = await response.text();
        
        const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
        const title = titleMatch ? titleMatch[1] : 'Unknown Title';
        
        const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
        const durationSeconds = durationMatch ? durationMatch[1] : null;
        let duration = 'Unknown';
        if (durationSeconds) {
            const mins = Math.floor(durationSeconds / 60);
            const secs = durationSeconds % 60;
            duration = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        const meta = { title, duration };
        fs.writeFileSync(cachePath, JSON.stringify(meta));
        return meta;
    } catch (e) {
        return { title: 'Unknown Title', duration: 'Unknown' };
    }
}

async function main() {
    const url = process.argv[2];
    if (!url) {
        console.error('Please provide a YouTube URL');
        process.exit(1);
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
        console.error('Invalid YouTube URL');
        process.exit(1);
    }

    const metadata = await fetchMetadata(videoId);
    const transcriptCachePath = path.join(CACHE_DIR, `${videoId}_transcript.txt`);

    console.log(`Video Title: ${metadata.title}`);
    console.log(`Duration: ${metadata.duration}\n`);

    if (fs.existsSync(transcriptCachePath)) {
        console.log(fs.readFileSync(transcriptCachePath, 'utf8'));
        return;
    }

    // Call python youtube-transcript-api
    const python = spawn('python3', ['-m', 'youtube_transcript_api', videoId, '--format', 'text']);
    
    let transcript = '';
    let error = '';

    python.stdout.on('data', (data) => {
        transcript += data.toString();
    });

    python.stderr.on('data', (data) => {
        error += data.toString();
    });

    python.on('close', (code) => {
        if (code !== 0) {
            if (error.includes('Could not retrieve a transcript')) {
                console.error('No transcript available for this video (it might be disabled or the video might be private).');
            } else if (error.includes('VideoUnavailable')) {
                console.error('The video is unavailable.');
            } else {
                console.error(`Error: ${error}`);
            }
            process.exit(1);
        }
        
        // Handle long transcripts - truncate to ~30k chars to stay within token limits if necessary
        const maxLength = 60000; 
        if (transcript.length > maxLength) {
            transcript = transcript.substring(0, maxLength) + "\n\n[Transcript truncated due to length...]";
        }
        
        fs.writeFileSync(transcriptCachePath, transcript);
        console.log(transcript);
    });
}

main();
