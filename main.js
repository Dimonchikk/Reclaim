// Reclaim — головний процес.
// Застосунок нічого не обходить: він відкриває офіційні сторінки Apple,
// читає базову інформацію про iPhone вбудованими утилітами libimobiledevice
// і просить пристрій показати системне вікно «Довіряти цьому комп'ютеру».
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { execFile, spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

// Зовнішні адреси: лише офіційні сервіси Apple та Microsoft Store.
const ALLOWED_HOSTS = [
  'iforgot.apple.com',
  'appleid.apple.com',
  'support.apple.com',
  'getsupport.apple.com',
  'www.icloud.com',
  'www.apple.com',
  'apps.microsoft.com',
];
const APPLE_DEVICES_STORE_ID = '9NP83LWLPZ9K'; // «Apple Devices» від Apple у Microsoft Store
const APPLE_SERVICE = 'Apple Mobile Device Service';

// Вбудовані утиліти: поруч із кодом (розробка) або в resources/bin (зібраний застосунок).
const BIN_DIR = app.isPackaged ? path.join(process.resourcesPath, 'bin') : path.join(__dirname, 'bin');

function openSafe(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' && ALLOWED_HOSTS.includes(u.hostname)) {
      shell.openExternal(u.toString());
      return true;
    }
  } catch (_) {}
  return false;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 940,
    minHeight: 640,
    backgroundColor: '#F5F5F7',
    title: 'Reclaim',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => {
    openSafe(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) e.preventDefault();
  });
}

// ---------- Вбудовані утиліти ----------
function toolPath(name) {
  return path.join(BIN_DIR, name + '.exe');
}
function toolsPresent() {
  return ['ideviceinfo', 'idevice_id', 'idevicepair'].every((n) => fs.existsSync(toolPath(n)));
}
function runTool(name, args = [], timeout = 8000) {
  return new Promise((resolve) => {
    const exe = toolPath(name);
    if (!fs.existsSync(exe)) return resolve({ ok: false, out: '', err: 'tool-missing' });
    execFile(exe, args, { cwd: BIN_DIR, timeout, windowsHide: true, encoding: 'utf8' }, (error, stdout, stderr) => {
      resolve({ ok: !error, out: String(stdout || ''), err: String(stderr || '') });
    });
  });
}

// ---------- Драйвер Apple (Apple Mobile Device Service) ----------
function serviceState() {
  return new Promise((resolve) => {
    execFile('sc', ['query', APPLE_SERVICE], { windowsHide: true, timeout: 5000 }, (err, stdout) => {
      const out = String(stdout || '');
      if (!/STATE/.test(out)) return resolve({ installed: false, running: false });
      resolve({ installed: true, running: /RUNNING/.test(out) });
    });
  });
}
// Служба Apple слухає локальний порт 27015 (usbmuxd): перевірка на випадок іншого імені служби.
function muxPortOpen() {
  return new Promise((resolve) => {
    const s = net.connect({ host: '127.0.0.1', port: 27015 });
    const done = (v) => { s.destroy(); resolve(v); };
    s.setTimeout(900, () => done(false));
    s.on('connect', () => done(true));
    s.on('error', () => done(false));
  });
}
async function driverState() {
  const svc = await serviceState();
  if (svc.installed) return svc;
  if (await muxPortOpen()) return { installed: true, running: true };
  return { installed: false, running: false };
}

ipcMain.handle('driver-status', () => driverState());

ipcMain.handle('device-status', async () => {
  const tools = toolsPresent();
  const driver = await driverState();
  if (!tools) return { state: 'no-tools', driver, tools };
  if (!driver.installed) return { state: 'no-driver', driver, tools };
  if (!driver.running) return { state: 'driver-stopped', driver, tools };

  const list = await runTool('idevice_id', ['-l']);
  const udids = list.out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (!udids.length) return { state: 'no-device', driver, tools };

  const r = await runTool('ideviceinfo', ['-u', udids[0]]);
  if (r.ok && r.out.trim()) {
    const map = {};
    r.out.split(/\r?\n/).forEach((line) => {
      const i = line.indexOf(':');
      if (i > 0) map[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    return {
      state: 'ready', driver, tools, count: udids.length,
      info: {
        name: map.DeviceName || '',
        model: map.ProductType || '',
        ios: map.ProductVersion || '',
        serial: map.SerialNumber || '',
        imei: map.InternationalMobileEquipmentIdentity || '',
        activation: map.ActivationState || '',
      },
    };
  }
  const text = (r.err + ' ' + r.out).trim();
  const detail = text.slice(0, 300);
  if (/passcode|unlock|locked/i.test(text)) return { state: 'locked', driver, tools, detail };
  if (/trust|pair|lockdownd/i.test(text)) return { state: 'not-trusted', driver, tools, detail };
  return { state: 'error', driver, tools, detail };
});

// Просить iPhone показати вікно «Довіряти цьому комп'ютеру?» — підтверджує лише власник на телефоні.
ipcMain.handle('device-pair', async () => {
  const r = await runTool('idevicepair', ['pair'], 20000);
  const text = (r.out + ' ' + r.err).trim();
  return { ok: /SUCCESS/i.test(text), text: text.slice(0, 300) };
});

// ---------- Відкриття офіційних джерел ----------
ipcMain.handle('open-external', (_e, url) => openSafe(url));
ipcMain.handle('open-apple-devices', async () => {
  try {
    await shell.openExternal('ms-windows-store://pdp/?productid=' + APPLE_DEVICES_STORE_ID);
  } catch (_) {
    shell.openExternal('https://apps.microsoft.com/detail/' + APPLE_DEVICES_STORE_ID.toLowerCase());
  }
  return true;
});

// ---------- Версія та видалення ----------
ipcMain.handle('app-info', () => ({
  version: app.getVersion(),
  packaged: app.isPackaged,
  tools: toolsPresent(),
}));

ipcMain.handle('uninstall', async (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const uninstaller = path.join(path.dirname(process.execPath), 'Uninstall Reclaim.exe');
  if (app.isPackaged && fs.existsSync(uninstaller)) {
    const { response } = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: ['Видалити', 'Скасувати'],
      defaultId: 1,
      cancelId: 1,
      title: 'Видалення Reclaim',
      message: 'Видалити Reclaim з цього комп’ютера?',
      detail: 'Запуститься стандартна програма видалення Windows.',
    });
    if (response !== 0) return { ok: false, mode: 'cancelled' };
    spawn(uninstaller, [], { detached: true, stdio: 'ignore' }).unref();
    app.quit();
    return { ok: true, mode: 'uninstaller' };
  }
  if (app.isPackaged) {
    shell.openExternal('ms-settings:appsfeatures'); // «Встановлені програми» у Windows
    return { ok: true, mode: 'settings' };
  }
  return { ok: false, mode: 'folder' }; // запуск із папки: нічого видаляти через Windows
});

// ---------- Пакет доказів власності → PDF ----------
const escHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

ipcMain.handle('save-proof-pdf', async (_e, data) => {
  const { items = [], serial = '', imei = '' } = data || {};
  const html = `<!doctype html><meta charset="utf-8"><body style="font-family:Segoe UI,Arial,sans-serif;padding:40px;color:#1D1D1F">
    <h1 style="font-weight:600">Докази власності iPhone</h1>
    <p style="color:#6E6E73">Складено в Reclaim · ${new Date().toLocaleDateString('uk-UA')}</p>
    <h2>Серійні номери</h2>
    <p>Серійний номер: <b>${escHtml(serial) || '—'}</b></p>
    <p>IMEI: <b>${escHtml(imei) || '—'}</b></p>
    <h2>Що підготовлено</h2>
    <ul>${items.map((i) => `<li>${i.done ? '☑' : '☐'} ${escHtml(i.label)}</li>`).join('')}</ul>
    <p style="color:#6E6E73;margin-top:32px">Цей список допомагає підготуватися до звернення в підтримку Apple.</p>`;
  const tmp = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  try {
    await tmp.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    const pdf = await tmp.webContents.printToPDF({ pageSize: 'A4' });
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Зберегти пакет доказів',
      defaultPath: 'dokazy-vlasnosti.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (canceled || !filePath) return { ok: false };
    fs.writeFileSync(filePath, pdf);
    return { ok: true, filePath };
  } finally {
    tmp.destroy();
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
