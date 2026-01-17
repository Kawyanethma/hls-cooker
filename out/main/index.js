"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const url = require("url");
const execa = require("execa");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const utils = require("@electron-toolkit/utils");
const icon = path.join(__dirname, "../../resources/icon.png");
const __filename$1 = url.fileURLToPath(require("url").pathToFileURL(__filename).href);
const __dirname$1 = path.dirname(__filename$1);
let mainWindow = null;
let splashWindow = null;
const activeProcesses = /* @__PURE__ */ new Map();
let bestEncoder = "libx264";
let hwAccelFlag = [];
let isRendererReady = false;
const appCloseOnError = ({
  title,
  message,
  detail
}) => {
  electron.dialog.showMessageBoxSync({
    type: "error",
    title,
    message,
    detail,
    buttons: ["OK"]
  });
  electron.app.quit();
};
const getBinaryPath = (tool) => {
  const isDev = !electron.app.isPackaged;
  const isWin = process.platform === "win32";
  const isMac = process.platform === "darwin";
  const binaryName = isWin ? `${tool}.exe` : tool;
  if (isDev) {
    const staticPath = tool === "ffmpeg" ? ffmpegStatic : ffprobeStatic.path;
    return staticPath.replace("app.asar", "app.asar.unpacked");
  }
  let binPath;
  if (tool === "ffmpeg") {
    binPath = path.join(process.resourcesPath, "ffmpeg-static", binaryName);
  } else {
    if (isMac) {
      const arch = process.arch === "arm64" ? "arm64" : "x64";
      binPath = path.join(
        process.resourcesPath,
        "ffprobe-static",
        "bin",
        "darwin",
        arch,
        binaryName
      );
    } else if (isWin) {
      binPath = path.join(
        process.resourcesPath,
        "ffprobe-static",
        "bin",
        "win32",
        "x64",
        binaryName
      );
    } else {
      binPath = path.join(
        process.resourcesPath,
        "ffprobe-static",
        "bin",
        "linux",
        "x64",
        binaryName
      );
    }
  }
  if (!isWin && fs.existsSync(binPath)) {
    try {
      fs.chmodSync(binPath, 493);
    } catch (e) {
      console.error(`Permission fix failed for ${tool}`, e);
    }
  }
  return binPath;
};
const ffmpegPath = getBinaryPath("ffmpeg");
const ffprobePath = getBinaryPath("ffprobe");
function safeLog(message) {
  console.log(message);
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send("log", message);
  }
  if (mainWindow && isRendererReady && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("log", message);
  }
}
async function detectHardwareAcceleration() {
  const checkEncoder = async (encoderName, flags) => {
    try {
      await execa.execa(ffmpegPath, [
        "-f",
        "lavfi",
        "-i",
        "color=c=black:s=1280x720:d=1",
        ...flags,
        "-c:v",
        encoderName,
        "-f",
        "null",
        "-"
      ]);
      return true;
    } catch (err) {
      return false;
    }
  };
  safeLog("Testing hardware acceleration capability...");
  if (await checkEncoder("h264_nvenc", ["-hwaccel", "cuda"])) {
    bestEncoder = "h264_nvenc";
    hwAccelFlag = ["-hwaccel", "cuda"];
    safeLog("🚀 Hardware Acceleration: NVIDIA (NVENC) Verified");
    return;
  }
  if (process.platform === "darwin" && await checkEncoder("h264_videotoolbox", [])) {
    bestEncoder = "h264_videotoolbox";
    hwAccelFlag = [];
    safeLog("🚀 Hardware Acceleration: Apple VideoToolbox Verified");
    return;
  }
  if (await checkEncoder("h264_qsv", ["-hwaccel", "qsv"])) {
    bestEncoder = "h264_qsv";
    hwAccelFlag = ["-hwaccel", "qsv"];
    safeLog("🚀 Hardware Acceleration: Intel QSV Verified");
    return;
  }
  if (await checkEncoder("h264_amf", [])) {
    bestEncoder = "h264_amf";
    hwAccelFlag = [];
    safeLog("🚀 Hardware Acceleration: AMD AMF Verified");
    return;
  }
  bestEncoder = "libx264";
  hwAccelFlag = [];
  safeLog("⚠️ Hardware acceleration check failed. Using CPU (libx264).");
}
async function checkBinaries() {
  try {
    const { stdout: ffOut } = await execa.execa(ffmpegPath, ["-version"]);
    const ffVer = ffOut.split("\n")[0].split("version ")[1].split(" ")[0];
    safeLog(`✅ FFmpeg detected: v${ffVer}`);
    const { stdout: fpOut } = await execa.execa(ffprobePath, ["-version"]);
    const fpVer = fpOut.split("\n")[0].split("version ")[1].split(" ")[0];
    safeLog(`✅ FFprobe detected: v${fpVer}`);
    return true;
  } catch (err) {
    appCloseOnError({
      title: "Critical Error",
      message: "Binaries missing",
      detail: `FFmpeg or FFprobe not found at ${ffmpegPath}`
    });
    safeLog(`❌ CRITICAL ERROR: Binaries missing at ${ffmpegPath}`);
    return false;
  }
}
function createSplashWindow() {
  splashWindow = new electron.BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/index.js"),
      // Use your existing preload!
      devTools: utils.is.dev,
      // Only enable if in development mode
      sandbox: false
    }
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    splashWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/splash.html`);
  } else {
    splashWindow.loadFile(path.join(__dirname$1, "../renderer/splash.html"));
  }
  splashWindow.on("closed", () => {
    splashWindow = null;
  });
}
function createMainWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: "HLS Cooker",
    frame: false,
    // Removes the standard Windows/Mac frame
    backgroundColor: "#020617",
    titleBarStyle: "hidden",
    // On Mac, this keeps the traffic lights but hides the bar
    titleBarOverlay: {
      color: "#1e1e1e",
      // Matches your app's background color
      symbolColor: "#ffffff",
      // Color of the min/max/close icons
      height: 40
    },
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../renderer/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
    isRendererReady = false;
  });
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.evohls.app");
  electron.app.on("browser-window-created", (_, win) => utils.optimizer.watchWindowShortcuts(win));
  createSplashWindow();
  if (!utils.is.dev) {
    mainWindow?.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools();
    });
  }
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
let isInitializing = false;
electron.ipcMain.on("splash-ready", async () => {
  if (isInitializing) return;
  isInitializing = true;
  const binariesOk = await checkBinaries();
  if (!binariesOk) {
    if (splashWindow) {
      splashWindow.webContents.send("init-error", "FFmpeg/FFprobe binaries missing.");
    }
    isInitializing = false;
    return;
  }
  await detectHardwareAcceleration();
  await new Promise((resolve) => setTimeout(resolve, 2500));
  createMainWindow();
  if (splashWindow) {
    splashWindow.close();
  }
});
electron.ipcMain.on("renderer-ready", () => {
  isRendererReady = true;
  if (mainWindow) mainWindow.webContents.send("log", `🚀 System Ready: Using ${bestEncoder}`);
});
electron.ipcMain.on("app-quit", () => {
  electron.app.quit();
});
electron.ipcMain.handle("select-files", async () => {
  const res = await electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Videos", extensions: ["mp4", "mkv", "mov", "avi"] }]
  });
  return res.filePaths;
});
electron.ipcMain.handle("select-output-dir", async () => {
  const res = await electron.dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"] });
  return res.filePaths[0];
});
electron.ipcMain.handle("open-in-explorer", async (_event, targetPath) => {
  if (!targetPath) return;
  await electron.shell.openPath(targetPath);
});
electron.ipcMain.on("cancel-file", (_, idx) => {
  const proc = activeProcesses.get(idx);
  if (proc) {
    proc.kill();
    activeProcesses.delete(idx);
    safeLog(`❌ Process #${idx} killed`);
  }
});
electron.ipcMain.on("run-encode", async (_, { files, choices, outputDir }) => {
  const resolutions = [
    { name: "low", size: "426:240", bitrate: "400k", ab: "32k", label: "l" },
    { name: "medium", size: "640:360", bitrate: "800k", ab: "32k", label: "m" },
    { name: "high", size: "854:480", bitrate: "1200k", ab: "32k", label: "h" },
    { name: "veryhigh", size: "1280:720", bitrate: "2400k", ab: "64k", label: "vh" },
    { name: "fullhd", size: "1920:1080", bitrate: "4800k", ab: "64k", label: "fhd" }
  ];
  for (let idx = 0; idx < files.length; idx++) {
    const input = files[idx];
    const fname = path.parse(input).name.toLowerCase().replace(/\s+/g, "_");
    const outdir = path.join(outputDir || path.dirname(input), fname);
    const currentFileDuration = await getVideoDuration(input);
    const activeRes = resolutions.filter((_2, i) => choices[i] === "y");
    const selectedNames = activeRes.map((r) => r.name);
    if (activeRes.length === 0 || currentFileDuration === 0) {
      safeLog(`⚠️ Skipping ${fname}: No resolutions selected or invalid duration.`);
      continue;
    }
    fs.mkdirSync(outdir, { recursive: true });
    let filterComplex = `[0:v]fps=25,split=${activeRes.length}`;
    activeRes.forEach((_2, i) => filterComplex += `[split${i}]`);
    filterComplex += ";";
    activeRes.forEach((res, i) => {
      filterComplex += `[split${i}]scale=${res.size}[${res.label}];`;
    });
    const encodingArgs = [];
    const streamMap = [];
    activeRes.forEach((res, i) => {
      encodingArgs.push(
        "-map",
        `[${res.label}]`,
        "-map",
        "0:a",
        `-c:v:${i}`,
        bestEncoder,
        `-b:v:${i}`,
        res.bitrate,
        `-c:a:${i}`,
        "aac",
        `-b:a:${i}`,
        res.ab,
        "-preset",
        "fast",
        // Stability
        "-g",
        "50",
        // Consistent GOP for HLS
        "-sc_threshold",
        "0"
      );
      streamMap.push(`v:${i},a:${i}`);
      fs.mkdirSync(path.join(outdir, `v${i}`), { recursive: true });
    });
    const ffmpegArgs = [
      "-y",
      ...hwAccelFlag,
      "-i",
      input,
      "-hide_banner",
      // Cleans up the logs
      "-sn",
      // Strip subtitles (HLS handles them differently)
      "-map_metadata",
      "-1",
      // Remove global metadata that can corrupt playlists
      "-filter_complex",
      filterComplex,
      ...encodingArgs,
      "-f",
      "hls",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-master_pl_name",
      `${fname}.m3u8`,
      "-hls_segment_filename",
      `${outdir}/v%v/seg%d.ts`,
      "-var_stream_map",
      streamMap.join(" "),
      `${outdir}/v%v/playlist.m3u8`
    ];
    const proc = execa.execa(ffmpegPath, ffmpegArgs);
    activeProcesses.set(idx, proc);
    const startTime = Date.now();
    proc.stderr?.on("data", (d) => {
      const line = d.toString();
      const m = line.match(/time=(\d+):(\d+):([\d.]+)/);
      if (m && currentFileDuration > 0) {
        const elapsed = +m[1] * 3600 + +m[2] * 60 + +m[3];
        const perc = Math.min(elapsed / currentFileDuration * 100, 100);
        const elapsedSec = (Date.now() - startTime) / 1e3;
        let eta = "...";
        if (perc > 1) {
          const totalTime = elapsedSec / (perc / 100);
          const remain = Math.max(0, totalTime - elapsedSec);
          const mins = Math.floor(remain / 60);
          const secs = Math.floor(remain % 60);
          eta = `${mins}:${secs.toString().padStart(2, "0")}`;
        }
        mainWindow?.webContents.send("update-progress", { idx, perc, eta });
      }
    });
    try {
      await proc;
      await new Promise((r) => setTimeout(r, 1e3));
      await handleShellCleanup(outdir, fname, selectedNames);
      mainWindow?.webContents.send("done-file", idx);
      safeLog(`✅ Finished ${fname}`);
    } catch (error) {
      if (!error.killed) safeLog(`❌ Error: ${error.message}`);
    } finally {
      activeProcesses.delete(idx);
    }
  }
});
async function getVideoDuration(filePath) {
  try {
    const { stdout } = await execa.execa(ffprobePath, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);
    return parseFloat(stdout) || 0;
  } catch (err) {
    safeLog(`❌ Could not get duration for ${filePath}`);
    return 0;
  }
}
async function handleShellCleanup(outdir, fname, selectedNames) {
  const masterPl = path.join(outdir, `${fname}.m3u8`);
  for (let i = 0; i < selectedNames.length; i++) {
    const q = selectedNames[i];
    const sourceVDir = path.join(outdir, `v${i}`);
    const targetDir = path.join(outdir, q);
    if (fs.existsSync(sourceVDir)) {
      if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });
      fs.renameSync(sourceVDir, targetDir);
      const oldPl = path.join(targetDir, "playlist.m3u8");
      const newPl = path.join(targetDir, `${fname}_${q}.m3u8`);
      if (fs.existsSync(oldPl)) fs.renameSync(oldPl, newPl);
      const files = fs.readdirSync(targetDir);
      for (const file of files) {
        if (file.startsWith("seg")) {
          const newName = file.replace("seg", `${fname}_${q}`);
          fs.renameSync(path.join(targetDir, file), path.join(targetDir, newName));
        }
      }
      let content = fs.readFileSync(newPl, "utf8");
      content = content.replace(/seg/g, `${fname}_${q}`);
      fs.writeFileSync(newPl, content);
      if (fs.existsSync(masterPl)) {
        let masterContent = fs.readFileSync(masterPl, "utf8");
        masterContent = masterContent.replace(`v${i}/playlist.m3u8`, `${q}/${fname}_${q}.m3u8`);
        fs.writeFileSync(masterPl, masterContent);
      }
    }
  }
}
exports.ffmpegPath = ffmpegPath;
exports.ffprobePath = ffprobePath;
