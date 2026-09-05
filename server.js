import express from "express"
import path from "node:path"
import fs from 'node:fs'
import {spawn} from "node:child_process"
import cors from "cors"
import {styleText} from 'node:util'

const app = express()
const PORT = 3000

let playlist = []
let currentTrackIndex = 0
let ffmpegProcess = null
const clients = new Set()

// 1. Load audio files into memory
const loadPlaylist = async () => {
    const tracks = await fs.promises.glob("tracks/**.mp3")

    for await (const track of tracks) {
        playlist.push(track)
    }

    if (playlist.length === 0) {
        console.log(styleText(['bold', 'red'], 'No audio files found in ./tracks'))
        process.exit(1)
    }
    console.log(styleText(['bold', 'green'], `Loaded ${playlist.length} tracks.`))
}

// 2. Stream the current track, then automatically trigger the next
const playTrack = (index) => {
    const trackPath = playlist[index]
    console.log(`▶ Okok, now playing: ${path.basename(trackPath)}`)

    // Spawn FFmpeg to convert this single file to a standard MP3 stream
    ffmpegProcess = spawn('ffmpeg', [
        '-re',                // Read at native speed (real-time)
        '-i', trackPath,
        '-f', 'mp3',          // Output format: MP3
        '-c:a', 'libmp3lame', // Encode to MP3
        '-b:a', '128k',       // Constant bitrate (important for seamless stitching)
        '-ar', '44100',       // 44.1kHz sample rate
        '-ac', '2',           // Stereo
        'pipe:1'              // Output to stdout
    ])

    // Push the audio chunks to all connected clients
    ffmpegProcess.stdout.on('data', (chunk) => {
        for (const client of clients) {
            client.write(chunk)
        }
    })

    ffmpegProcess.on('close', (code) => {
        ffmpegProcess = null
        // Move to next track (loop back to 0 at the end)
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length
        console.log(`Aaaaaaaaand, are you ready for the next track?`)
        playTrack(currentTrackIndex)
    });
}

// 3. HTTP Stream Endpoint for browsers
app.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache, no-store'
    })

    // Add this client to our broadcast list
    clients.add(res)
    console.log(styleText(['bold', 'green'], `Listener connected (${clients.size} total)`))

    // Remove client when they close the tab/stop playing
    req.on('close', () => {
        clients.delete(res)
        console.log(styleText(['bold', 'red'], `Listener left (${clients.size} total)`))
    });
});

app.use(cors())
// Serve the static frontend
app.use(express.static(path.join(import.meta.dirname, 'public')))

// Start Server
await loadPlaylist()
playTrack(currentTrackIndex) // Start the stream loop immediately

app.listen(PORT, () => {
    console.log(`Radio running at http://localhost:${PORT}`)
})
