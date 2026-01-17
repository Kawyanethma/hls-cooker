import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const customAPI = {
  // Handshake
  rendererReady: () => ipcRenderer.send('renderer-ready'),

  // File System
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  openInExplorer: (targetPath: string) => ipcRenderer.invoke('open-in-explorer', targetPath),

  // Encoding
  runEncode: (data) => ipcRenderer.send('run-encode', data),
  cancelFile: (idx) => ipcRenderer.send('cancel-file', idx),

  // Event Listeners
  onLog: (cb) => ipcRenderer.on('log', (_, msg) => cb(msg)),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (_, data) => cb(data)),
  onDoneFile: (cb) => ipcRenderer.on('done-file', (_, idx) => cb(idx))
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', customAPI) // <--- THIS MATCHES App.tsx
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore: <--- THIS MATCHES App.tsx
  window.electron = electronAPI
  // @ts-ignore : customAPI
  window.electronAPI = customAPI
}
