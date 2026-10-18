# NEXUS AI Phone Control

A lightweight AI phone-control dashboard and API starter built for local demo use. It simulates core phone actions such as dialing, messaging, device status checks, and sending simple control commands.

## Features

- Device health and status view
- Mock call initiation and termination
- SMS sending actions
- Remote device commands
- Browser dashboard for quick local testing

## Quick start

```bash
cd NEXUS-AI-Phone-Control
npm install
npm start
```

Then open:

- http://localhost:3000

## API endpoints

- `GET /api/health`
- `GET /api/device`
- `POST /api/call`
- `POST /api/sms`
- `POST /api/command`

## Notes

This project is intentionally simple and demo-focused. It is designed as a starting point for an AI-powered phone assistant and can be extended with real mobile integrations, voice pipelines, or async job processing.
