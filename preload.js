// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    
    // File system operations
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
    
    // App info
    getVersion: () => ipcRenderer.invoke('app-version'),
    
    // Native ZHTP API Bridge
    zhtpConnect: (nodeAddress) => ipcRenderer.invoke('zhtp-connect', nodeAddress),
    zhtpRequest: (requestData) => ipcRenderer.invoke('zhtp-request', requestData),
    zhtpDisconnect: () => ipcRenderer.invoke('zhtp-disconnect'),
    zhtpStatus: () => ipcRenderer.invoke('zhtp-status'),
});

// Expose a safe way to check if we're in Electron
contextBridge.exposeInMainWorld('isElectron', true);
