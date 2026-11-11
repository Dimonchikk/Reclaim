const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openAppleDevices: () => ipcRenderer.invoke('open-apple-devices'),
  driverStatus: () => ipcRenderer.invoke('driver-status'),
  deviceStatus: () => ipcRenderer.invoke('device-status'),
  devicePair: () => ipcRenderer.invoke('device-pair'),
  appInfo: () => ipcRenderer.invoke('app-info'),
  uninstall: () => ipcRenderer.invoke('uninstall'),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  openRelease: () => ipcRenderer.invoke('open-release'),
  changelog: () => ipcRenderer.invoke('changelog'),
  historyList: () => ipcRenderer.invoke('history-list'),
  historyClear: () => ipcRenderer.invoke('history-clear'),
  saveProofPdf: (data) => ipcRenderer.invoke('save-proof-pdf', data),
});
