"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const customAPI = {
  // Handshake
  rendererReady: () => electron.ipcRenderer.send("renderer-ready"),
  // File System
  selectFiles: () => electron.ipcRenderer.invoke("select-files"),
  selectOutputDir: () => electron.ipcRenderer.invoke("select-output-dir"),
  openInExplorer: (targetPath) => electron.ipcRenderer.invoke("open-in-explorer", targetPath),
  // Encoding
  runEncode: (data) => electron.ipcRenderer.send("run-encode", data),
  cancelFile: (idx) => electron.ipcRenderer.send("cancel-file", idx),
  // Event Listeners
  onLog: (cb) => electron.ipcRenderer.on("log", (_, msg) => cb(msg)),
  onUpdateProgress: (cb) => electron.ipcRenderer.on("update-progress", (_, data) => cb(data)),
  onDoneFile: (cb) => electron.ipcRenderer.on("done-file", (_, idx) => cb(idx))
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("electronAPI", customAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.electronAPI = customAPI;
}
