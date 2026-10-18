# NEXUS AI Phone Control

NEXUS AI Phone Control is a production-ready demo for an AI-powered phone assistant. It combines a local Express backend, natural language command parsing, optional OpenAI integration, and a simple browser dashboard for controlling a virtual smartphone.

## Features

- AI assistant endpoint for natural-language phone actions
- Device health and status monitoring
- Call and SMS simulation
- Security/device actions such as lock, unlock, ring, mute, and camera commands
- Optional OpenAI API integration for real AI reasoning
- Simple auth/session flow for secure demo access

## Quick start

```bash
cd NEXUS-AI-Phone-Control
npm install
cp .env.example .env
npm start
```

Open the app in your browser:

- http://localhost:3000

## Environment setup

Create a `.env` file based on `.env.example` if you want to enable real AI processing:

```env
PORT=3000
JWT_SECRET=change-this-secret
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

If `OPENAI_API_KEY` is not set, the app falls back to a built-in local intent parser.

## Example prompts

- "Call +1 555 123 4567"
- "Send a reminder to +1 555 123 4567"
- "Check my battery and signal"
- "Lock the device"
- "What is the current status?"

## API

- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/device`
- `POST /api/call`
- `POST /api/sms`
- `POST /api/command`
- `POST /api/assistant`

## Notes

This project is intended as an extensible starter. It is ready to be connected to real telephony providers, message APIs, or a hosted LLM service when needed.
