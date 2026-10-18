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
  lastMessage: null,
  lastCommand: null
};

const normalizePhone = (value) => {
  if (!value) return null;
  return String(value).replace(/[^+\d]/g, '').trim();
};

const getStatusSummary = () => {
  return {
    status: deviceState.status,
    battery: deviceState.battery,
    signal: deviceState.signal,
    location: deviceState.location,
    callStatus: deviceState.callStatus,
    lastActivity: deviceState.lastActivity,
    device: deviceState.name
  };
};

const parseCommand = (text) => {
  const cleaned = String(text || '').trim().toLowerCase();

  if (!cleaned) {
    return { type: 'unknown', intent: 'unknown', message: 'No command provided.' };
  }

  if (/call\s|dial\s|phone\s/.test(cleaned)) {
    const number = normalizePhone(cleaned.match(/\+?\d[\d\s()+-]{6,}/)?.[0] || cleaned.match(/\d{7,}/)?.[0]);
    return {
      type: 'call',
      intent: 'call',
      number,
      message: number ? `Placing a call to ${number}.` : 'Please include a valid phone number.'
    };
  }

  if (/sms|text\s+message|send\s+text/.test(cleaned)) {
    const number = normalizePhone(cleaned.match(/\+?\d[\d\s()+-]{6,}/)?.[0] || cleaned.match(/\d{7,}/)?.[0]);
    const message = cleaned.replace(/(sms|text|message|send)/g, '').trim();
    return {
      type: 'sms',
      intent: 'sms',
      number,
      messageText: message || 'Reminder from NEXUS AI',
      message: number ? `Preparing SMS to ${number}.` : 'Please include a valid recipient number.'
    };
  }

  if (/status|health|battery|signal|location|info/.test(cleaned)) {
    return { type: 'status', intent: 'status' };
  }

  if (/lock/.test(cleaned)) {
    return { type: 'command', intent: 'lock', action: 'lock' };
  }

  if (/unlock/.test(cleaned)) {
    return { type: 'command', intent: 'unlock', action: 'unlock' };
  }

  if (/mute/.test(cleaned)) {
    return { type: 'command', intent: 'mute', action: 'mute' };
  }

  if (/ring/.test(cleaned)) {
    return { type: 'command', intent: 'ring', action: 'ring' };
  }

  if (/flash|camera/.test(cleaned)) {
    return { type: 'command', intent: 'flash', action: 'flash' };
  }

  return { type: 'unknown', intent: 'unknown', message: 'I did not understand that request.' };
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
    ...getStatusSummary(),
    uptime: '6h 24m'
  });
});

app.post('/api/call', (req, res) => {
  const { number } = req.body || {};
  const normalizedNumber = normalizePhone(number);

  if (!normalizedNumber) {
    return res.status(400).json({ error: 'A phone number is required.' });
  }

  deviceState.callStatus = 'dialing';
  deviceState.lastDialed = normalizedNumber;
  deviceState.lastActivity = 'Dialing ' + normalizedNumber;

  res.json({
    status: 'queued',
    number: normalizedNumber,
    callStatus: deviceState.callStatus,
    message: 'Call has been queued successfully.'
  });
});

app.post('/api/sms', (req, res) => {
  const { to, message } = req.body || {};
  const normalizedTo = normalizePhone(to);

  if (!normalizedTo || !message) {
    return res.status(400).json({ error: 'Recipient and message are required.' });
  }

  deviceState.lastMessage = {
    to: normalizedTo,
    message,
    sentAt: new Date().toISOString()
  };
  deviceState.lastActivity = 'SMS sent to ' + normalizedTo;

  res.json({
    status: 'sent',
    to: normalizedTo,
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

  deviceState.lastCommand = action;
  deviceState.lastActivity = 'Command executed: ' + action;

  res.json({
    status: 'executed',
    action,
    message: 'Device command accepted.'
  });
});

app.post('/api/assistant', (req, res) => {
  const { prompt } = req.body || {};
  const parsed = parseCommand(prompt);

  if (parsed.type === 'call') {
    if (!parsed.number) {
      return res.json({
        reply: 'I can place a call, but I need a valid phone number to continue.',
        action: 'call',
        success: false
      });
    }

    const response = { status: 'queued', number: parsed.number, callStatus: 'dialing' };
    deviceState.callStatus = 'dialing';
    deviceState.lastDialed = parsed.number;
    deviceState.lastActivity = 'AI placed call to ' + parsed.number;

    return res.json({
      reply: `Calling ${parsed.number} now.`,
      action: 'call',
      success: true,
      data: response
    });
  }

  if (parsed.type === 'sms') {
    if (!parsed.number) {
      return res.json({
        reply: 'I can send a text, but I need a recipient number.',
        action: 'sms',
        success: false
      });
    }

    deviceState.lastMessage = {
      to: parsed.number,
      message: parsed.messageText,
      sentAt: new Date().toISOString()
    };
    deviceState.lastActivity = 'AI sent SMS to ' + parsed.number;

    return res.json({
      reply: `SMS sent to ${parsed.number}.`,
      action: 'sms',
      success: true,
      data: {
        to: parsed.number,
        message: parsed.messageText,
        timestamp: deviceState.lastMessage.sentAt
      }
    });
  }

  if (parsed.type === 'command') {
    deviceState.lastCommand = parsed.action;
    deviceState.lastActivity = 'AI command: ' + parsed.action;

    return res.json({
      reply: `The device ${parsed.action} command was accepted.`,
      action: parsed.action,
      success: true
    });
  }

  if (parsed.type === 'status') {
    const summary = getStatusSummary();
    return res.json({
      reply: `Battery is ${summary.battery}%, signal is ${summary.signal}, location is ${summary.location}, and device status is ${summary.status}.`,
      action: 'status',
      success: true,
      data: summary
    });
  }

  return res.json({
    reply: parsed.message || 'I did not understand that request.',
    action: 'unknown',
    success: false
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`NEXUS AI Phone Control running on http://localhost:${PORT}`);
});
