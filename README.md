# poc-webradio

> A POC for live audio streaming with NodeJs.

## Installation

```bash
git clone https://github.com/AlbanCrepel/poc-webradio.git
cd poc-webradio
npm install
```

You will need to have [ffmpeg](https://ffmpeg.org/download.html) installed on your machine to process audio.

After installing, check that it is available via CLI with the command `ffmpeg -version` in your terminal.

## Run

```bash
npm run dev # server running on http://localhost:3000
```

The audio streaming is live on http://localhost:3000/stream, and the client plays it on http://localhost:3000.

It plays every track in the `tracks` folder and loop them when finished.

If you want to stream audio not from files but from a tab or your mic, check this example: 
[Medium article](https://medium.com/@mustneerahmadr7/broadcasting-and-streaming-live-audio-using-node-js-ffmpeg-react-and-react-native-09604f0937f0) 
and [code](https://github.com/mustneerar7/live_audio_streaming_backend/blob/main/server.js).

You can also dig podcast streaming, and find sources on https://rss.com/tools/find-my-feed/.

You can automate things with [node-cron](https://github.com/node-cron/node-cron), running things periodically.

You can play with live connexion with [web sockets: ws](https://github.com/websockets/ws) or [socket.io](https://github.com/socketio/socket.IO).
