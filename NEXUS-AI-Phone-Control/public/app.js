const responseBox = document.getElementById('responseBox');
const statusLabel = document.getElementById('deviceStatus');
const batteryEl = document.getElementById('battery');
const signalEl = document.getElementById('signal');
const locationEl = document.getElementById('location');
const deviceNameEl = document.getElementById('deviceName');
const activityEl = document.getElementById('lastActivity');

const setStatus = (message, tone = 'neutral') => {
  responseBox.textContent = message;
  responseBox.dataset.tone = tone;
};

const refreshDevice = async () => {
  try {
    const res = await fetch('/api/device');
    const data = await res.json();

    statusLabel.textContent = data.status.toUpperCase();
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

document.getElementById('callBtn').addEventListener('click', callPhone);
document.getElementById('smsBtn').addEventListener('click', sendSms);
document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => triggerCommand(button.dataset.action));
});

refreshDevice();
