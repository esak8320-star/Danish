const responseBox = document.getElementById('responseBox');
const assistantChat = document.getElementById('assistantChat');
const assistantInput = document.getElementById('assistantInput');
const statusLabel = document.getElementById('deviceStatus');
const batteryEl = document.getElementById('battery');
const signalEl = document.getElementById('signal');
const locationEl = document.getElementById('location');
const deviceNameEl = document.getElementById('deviceName');
const activityEl = document.getElementById('lastActivity');

const appendChat = (role, text) => {
  const entry = document.createElement('div');
  entry.className = `chat-entry ${role}`;
  entry.textContent = text;
  assistantChat.appendChild(entry);
  assistantChat.scrollTop = assistantChat.scrollHeight;
};

const setStatus = (message, tone = 'neutral') => {
  responseBox.textContent = message;
  responseBox.dataset.tone = tone;
};

const refreshDevice = async () => {
  try {
    const res = await fetch('/api/device');
    const data = await res.json();

    statusLabel.textContent = String(data.status || 'ONLINE').toUpperCase();
    batteryEl.textContent = `${data.battery}%`;
    signalEl.textContent = data.signal;
    locationEl.textContent = data.location;
    deviceNameEl.textContent = data.name;
    activityEl.textContent = data.lastActivity;
  } catch (error) {
    setStatus('Unable to fetch device data.', 'error');
  }
};

const callPhone = async () => {
  const number = document.getElementById('numberInput').value.trim();

  if (!number) {
    setStatus('Enter a phone number before dialing.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number })
    });

    const data = await res.json();
    setStatus(data.message || 'Call queued.', 'success');
    await refreshDevice();
  } catch (error) {
    setStatus('Call failed to queue.', 'error');
  }
};

const sendSms = async () => {
  const to = document.getElementById('numberInput').value.trim();
  const message = document.getElementById('messageInput').value.trim();

  if (!to || !message) {
    setStatus('Provide a recipient and a message.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message })
    });

    const data = await res.json();
    setStatus(`SMS sent to ${data.to}.`, 'success');
    await refreshDevice();
  } catch (error) {
    setStatus('Unable to send SMS.', 'error');
  }
};

const triggerCommand = async (action) => {
  try {
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    const data = await res.json();
    setStatus(`${data.action} command accepted.`, 'success');
    await refreshDevice();
  } catch (error) {
    setStatus('Command execution failed.', 'error');
  }
};

const handleAssistantPrompt = async () => {
  const prompt = assistantInput.value.trim();
  if (!prompt) return;

  appendChat('user', prompt);
  assistantInput.value = '';

  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    appendChat('assistant', data.reply || 'I am ready to help.');
    setStatus(data.reply || 'Request processed.', data.success ? 'success' : 'neutral');
    await refreshDevice();
  } catch (error) {
    appendChat('assistant', 'The assistant could not process that request.');
    setStatus('Assistant request failed.', 'error');
  }
};

document.getElementById('callBtn').addEventListener('click', callPhone);
document.getElementById('smsBtn').addEventListener('click', sendSms);
document.getElementById('assistantBtn').addEventListener('click', handleAssistantPrompt);
document.getElementById('assistantInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleAssistantPrompt();
});
document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => triggerCommand(button.dataset.action));
});

refreshDevice();
