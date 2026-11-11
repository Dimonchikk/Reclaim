const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openAppleDevices: () => ipcRenderer.invoke('open-apple-devices'),
  driverStatus: () => ipcRenderer.invoke('driver-status'),
  deviceStatus: () => ipcRenderer.invoke('device-status'),
  devicePair: () => ipcRenderer.invoke('device-pair'),
  appInfo: () => ipcRenderer.invoke('app-info'),
  uninstall: () => ipcRenderer.invoke('uninstall'),
  saveProofPdf: (data) => ipcRenderer.invoke('save-proof-pdf', data),
});
