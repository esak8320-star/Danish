# NEXUS AI Phone Control

NEXUS AI Phone Control is a demo-ready AI phone management assistant with a browser dashboard and a lightweight local backend. It lets you prompt the system in natural language to trigger device actions such as phone calls, SMS, security commands, and status checks.

## Features

- Natural language command parsing
- Phone call simulation
- SMS sending simulation
- Device status and health view
- Security action controls
- Browser-based control dashboard

## Run locally

```bash
cd NEXUS-AI-Phone-Control
npm install
npm start
```

Then open:

- http://localhost:3000

## Example AI prompts

- "Call +1 555 123 4567"
- "Send a reminder to +1 555 123 4567"
- "Check battery status"
- "Lock the device"
- "What is the current device status?"

## API

- `GET /api/health`
- `GET /api/device`
- `POST /api/call`
- `POST /api/sms`
- `POST /api/command`
- `POST /api/assistant`

## Architecture

This version uses a Python-free Node.js stack for simple deployment and quick iteration. The assistant logic is intentionally lightweight and easy to replace with a third-party AI service or workflow engine later.
