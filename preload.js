const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  setLang: (l) => ipcRenderer.send('set-lang', l),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openAppleDevices: () => ipcRenderer.invoke('open-apple-devices'),
  driverStatus: () => ipcRenderer.invoke('driver-status'),
  deviceStatus: () => ipcRenderer.invoke('device-status'),
  deviceDiag: (udid) => ipcRenderer.invoke('device-diag', udid),
  devicePair: () => ipcRenderer.invoke('device-pair'),
  appInfo: () => ipcRenderer.invoke('app-info'),
  uninstall: () => ipcRenderer.invoke('uninstall'),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  openRelease: () => ipcRenderer.invoke('open-release'),
  changelog: () => ipcRenderer.invoke('changelog'),
  historyList: () => ipcRenderer.invoke('history-list'),
  historyClear: () => ipcRenderer.invoke('history-clear'),
  wallpaper: () => ipcRenderer.invoke('wallpaper'),
  saveProofPdf: (data) => ipcRenderer.invoke('save-proof-pdf', data),
});
