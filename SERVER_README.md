# Camera Card Battle Operator — Deployment & Signaling Guide

This project now runs **WebRTC with WebSocket-only signaling**. A tiny Node server serves the static page and relays signaling messages per room code.

## Local run (for testing)
```bash
npm install
npm start          # starts HTTP + WS on http://localhost:8787 (ws://localhost:8787/ws)
```
Open http://localhost:8787 in two browsers/devices, share a code, and connect.

## Deploying to Vercel
This repo includes `vercel.json` to run the Node signaling server on Vercel.

1) Install Vercel CLI and log in:
```bash
npm i -g vercel
vercel login
```
2) Deploy:
```bash
vercel deploy --prod
```
Vercel will build with `@vercel/node`, route `/ws` to the WebSocket handler, and serve `index.html` for other routes via `signaling-server.js`.
> Your Vercel project/plan must allow WebSocket upgrades. If WebSockets are blocked, run the server on another host and point the app’s signaling URL to it.

## Frontend configuration
- The app defaults `signalingUrl` to `wss://<current-host>/ws` (or `ws://` on http).
- You can override the signaling URL in the UI if you run the server elsewhere.

## Notes
- Remove/avoid `file://` loads; run via the Node server so WebSockets can connect.
- Both players must point to the **same signaling server URL** and use the same invite code.
- The relay keeps messages in memory only; it simply fans out signals to peers in the same room code. For scaling or persistence, replace it with a more robust signaling backend.
