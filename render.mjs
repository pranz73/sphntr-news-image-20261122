import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import net from 'node:net';

const here = path.dirname(fileURLToPath(import.meta.url));
const policy = '/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt';
const profile = await mkdtemp(path.join(tmpdir(), 'world-ledger-chrome-'));
const output = path.join(here, 'entry.png');
let browser;
let socket;
let browserSpawnError;

async function unusedPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function waitForVersion(port) {
  const deadline = Date.now() + 15000;
  let lastError;
  while (Date.now() < deadline) {
    if (browserSpawnError) throw browserSpawnError;
    if (browser.exitCode !== null) throw new Error(`Chromium exited with status ${browser.exitCode}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return await response.json();
      lastError = new Error(`Debugging endpoint returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Chromium debugging endpoint did not start: ${lastError}`);
}

function connectWebSocket(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const onError = event => reject(event.error ?? new Error('WebSocket connection failed'));
    ws.addEventListener('open', () => {
      ws.removeEventListener('error', onError);
      resolve(ws);
    }, { once: true });
    ws.addEventListener('error', onError, { once: true });
  });
}

function protocol(ws) {
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  return (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function stopBrowser() {
  if (!browser || browser.exitCode !== null) return;
  browser.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => browser.once('exit', resolve)),
    new Promise(resolve => setTimeout(resolve, 3000)),
  ]);
  if (browser.exitCode === null) {
    browser.kill('SIGKILL');
    await new Promise(resolve => browser.once('exit', resolve));
  }
}

try {
  await rm(output, { force: true });
  const port = await unusedPort();
  browser = spawn('/opt/meta-chromium/chrome', [
    '--headless', '--no-sandbox', '--disable-gpu', '--disable-crash-reporter',
    '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1024,1024',
    `--user-data-dir=${profile}`,
    `--hatch-webgl-allowed-domains-file=${policy}`,
    '--hatch-webgl-allowed-domains-sha256=8097045f0459c96c4cdc76e3a1af4e0f43f640b4b59c43d6db35e3641c0264c6',
    `--remote-debugging-port=${port}`,
    'about:blank',
  ], { stdio: 'ignore' });
  browser.on('error', error => { browserSpawnError = error; });

  await waitForVersion(port);
  const pageUrl = new URL(`file://${path.join(here, 'index.html')}`).href;
  const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
  if (!targetResponse.ok) throw new Error(`Could not open entry page: HTTP ${targetResponse.status}`);
  const target = await targetResponse.json();
  if (!target.webSocketDebuggerUrl) throw new Error('New page target did not provide a WebSocket URL');

  socket = await connectWebSocket(target.webSocketDebuggerUrl);
  const send = protocol(socket);
  await send('Page.enable');
  await new Promise(resolve => setTimeout(resolve, 700));
  const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(output, Buffer.from(data, 'base64'));
} finally {
  if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  await stopBrowser();
  await rm(profile, { recursive: true, force: true });
}
