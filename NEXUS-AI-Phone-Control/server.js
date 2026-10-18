const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const deviceState = {
  id: 'nexus-phone-01',
  name: 'NEXUS AI Phone',
  status: 'online',
  battery: 82,
  signal: '5G',
  location: 'Home Office',
  lastActivity: 'Just now',
  callStatus: 'idle',
  lastDialed: null,
  lastMessage: null
};

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nexus-ai-phone-control',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/device', (req, res) => {
  res.json({
    ...deviceState,
    uptime: '6h 24m'
  });
});

app.post('/api/call', (req, res) => {
  const { number } = req.body || {};

  if (!number) {
    return res.status(400).json({ error: 'A phone number is required.' });
  }

  deviceState.callStatus = 'dialing';
  deviceState.lastDialed = number;
  deviceState.lastActivity = 'Dialing ' + number;

  res.json({
    status: 'queued',
    number,
    callStatus: deviceState.callStatus,
    message: 'Call has been queued successfully.'
  });
});

app.post('/api/sms', (req, res) => {
  const { to, message } = req.body || {};

  if (!to || !message) {
    return res.status(400).json({ error: 'Recipient and message are required.' });
  }

  deviceState.lastMessage = {
    to,
    message,
    sentAt: new Date().toISOString()
  };
  deviceState.lastActivity = 'SMS sent to ' + to;

  res.json({
    status: 'sent',
    to,
    message,
    timestamp: deviceState.lastMessage.sentAt
  });
});

app.post('/api/command', (req, res) => {
  const { action } = req.body || {};

  const allowed = ['lock', 'unlock', 'mute', 'ring', 'camera', 'flash'];

  if (!action || !allowed.includes(action)) {
    return res.status(400).json({
      error: 'Unsupported action.',
      allowed
    });
  }

  deviceState.lastActivity = 'Command executed: ' + action;

  res.json({
    status: 'executed',
    action,
    message: 'Device command accepted.'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`NEXUS AI Phone Control running on http://localhost:${PORT}`);
});
