import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path, { join, dirname, parse } from 'path'
import fs, { chmodSync } from 'fs'
import { fileURLToPath } from 'url'
import { execa } from 'execa'
import ffmpegStatic from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// ------------------ ESM PATH FIX ------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ------------------ GLOBAL STATE ------------------
let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null // SPLASH WINDOW REF
// eslint-disable-next-line
const activeProcesses = new Map<number, any>()
let bestEncoder = 'libx264'
let hwAccelFlag: string[] = []
let isRendererReady = false

const appCloseOnError = ({
  title,
  message,
  detail
}: {
  title: string
  message: string
  detail: string
}): void => {
  dialog.showMessageBoxSync({
    type: 'error',
    title: title,
    message: message,
    detail: detail,
    buttons: ['OK']
  })
  // Once they click OK, the code continues to this line:
  app.quit()
}
// ------------------ BINARY PATHS ------------------
const getBinaryPath = (tool: 'ffmpeg' | 'ffprobe'): string => {
  const isDev = !app.isPackaged
  const isWin = process.platform === 'win32'
  const isMac = process.platform === 'darwin'
  const binaryName = isWin ? `${tool}.exe` : tool

  if (isDev) {
    const staticPath = tool === 'ffmpeg' ? ffmpegStatic : ffprobeStatic.path
    return staticPath.replace('app.asar', 'app.asar.unpacked')
  }

  // PRODUCTION PATHS based on your folder listing
  let binPath: string

  if (tool === 'ffmpeg') {
    // ffmpeg-static/ffmpeg
    binPath = path.join(process.resourcesPath, 'ffmpeg-static', binaryName)
  } else {
    // ffprobe-static/bin/darwin/[arch]/ffprobe
    if (isMac) {
      const arch = process.arch === 'arm64' ? 'arm64' : 'x64'
      binPath = path.join(
        process.resourcesPath,
        'ffprobe-static',
        'bin',
        'darwin',
        arch,
        binaryName
      )
    } else if (isWin) {
      binPath = path.join(
        process.resourcesPath,
        'ffprobe-static',
        'bin',
        'win32',
        'x64',
        binaryName
      )
    } else {
      // Linux
      binPath = path.join(
        process.resourcesPath,
        'ffprobe-static',
        'bin',
        'linux',
        'x64',
        binaryName
      )
    }
  }

  // Final validation and permission fix
  if (!isWin && fs.existsSync(binPath)) {
    try {
      chmodSync(binPath, 0o755)
    } catch (e) {
      console.error(`Permission fix failed for ${tool}`, e)
    }
  }

  return binPath
}

export const ffmpegPath = getBinaryPath('ffmpeg')
export const ffprobePath = getBinaryPath('ffprobe')

// ------------------ LOGGING SYSTEM ------------------
function safeLog(message: string): void {
  console.log(message)

  // 1. Send to Splash Screen if it exists
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('log', message)
  }

  // 2. Send to Main Window (React) if ready
  if (mainWindow && isRendererReady && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('log', message)
  }
}

// ------------------ HARDWARE DETECTION ------------------
async function detectHardwareAcceleration(): Promise<void> {
  const checkEncoder = async (encoderName: string, flags: string[]): Promise<boolean> => {
    try {
      await execa(ffmpegPath, [
        '-f',
        'lavfi',
        '-i',
        'color=c=black:s=1280x720:d=1',
        ...flags,
        '-c:v',
        encoderName,
        '-f',
        'null',
        '-'
      ])
      return true
      // eslint-disable-next-line
    } catch (err: unknown) {
      return false
    }
  }

  safeLog('Testing hardware acceleration capability...')

  if (await checkEncoder('h264_nvenc', ['-hwaccel', 'cuda'])) {
    bestEncoder = 'h264_nvenc'
    hwAccelFlag = ['-hwaccel', 'cuda']
    safeLog('🚀 Hardware Acceleration: NVIDIA (NVENC) Verified')
    return
  }

  if (process.platform === 'darwin' && (await checkEncoder('h264_videotoolbox', []))) {
    bestEncoder = 'h264_videotoolbox'
    hwAccelFlag = []
    safeLog('🚀 Hardware Acceleration: Apple VideoToolbox Verified')
    return
  }

  if (await checkEncoder('h264_qsv', ['-hwaccel', 'qsv'])) {
    bestEncoder = 'h264_qsv'
    hwAccelFlag = ['-hwaccel', 'qsv']
    safeLog('🚀 Hardware Acceleration: Intel QSV Verified')
    return
  }

  if (await checkEncoder('h264_amf', [])) {
    bestEncoder = 'h264_amf'
    hwAccelFlag = []
    safeLog('🚀 Hardware Acceleration: AMD AMF Verified')
    return
  }

  bestEncoder = 'libx264'
  hwAccelFlag = []
  safeLog('⚠️ Hardware acceleration check failed. Using CPU (libx264).')
}

// ------------------ BINARY CHECK ------------------
async function checkBinaries(): Promise<boolean> {
  try {
    const { stdout: ffOut } = await execa(ffmpegPath, ['-version'])
    const ffVer = ffOut.split('\n')[0].split('version ')[1].split(' ')[0]
    safeLog(`✅ FFmpeg detected: v${ffVer}`)

    const { stdout: fpOut } = await execa(ffprobePath, ['-version'])
    const fpVer = fpOut.split('\n')[0].split('version ')[1].split(' ')[0]
    safeLog(`✅ FFprobe detected: v${fpVer}`)

    return true
    // eslint-disable-next-line
  } catch (err) {
    appCloseOnError({
      title: 'Critical Error',
      message: 'Binaries missing',
      detail: `FFmpeg or FFprobe not found at ${ffmpegPath}`
    })
    safeLog(`❌ CRITICAL ERROR: Binaries missing at ${ffmpegPath}`)
    return false
  }
}

// ------------------ WINDOWS ------------------

function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // Use your existing preload!
      devTools: is.dev, // Only enable if in development mode
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // Load the splash.html file from the dev server
    splashWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`)
  } else {
    splashWindow.loadFile(join(__dirname, '../renderer/splash.html'))
  }
  splashWindow.on('closed', () => {
    splashWindow = null
  })
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'HLS Cooker',
    frame: false, // Removes the standard Windows/Mac frame
    backgroundColor: '#020617',
    titleBarStyle: 'hidden', // On Mac, this keeps the traffic lights but hides the bar
    titleBarOverlay: {
      color: '#1e1e1e', // Matches your app's background color
      symbolColor: '#ffffff', // Color of the min/max/close icons
      height: 40
    },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow!.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load React App
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    isRendererReady = false
  })
}

// ------------------ APP LIFECYCLE ------------------

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.evohls.app')
  app.on('browser-window-created', (_, win) => optimizer.watchWindowShortcuts(win))

  // 1. Start with Splash Screen
  createSplashWindow()

  if (!is.dev) {
    mainWindow?.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ------------------ IPC HANDLERS ------------------

let isInitializing = false // 👈 Add this variable at the top level

ipcMain.on('splash-ready', async () => {
  // If we are already running the check, ignore duplicate requests
  if (isInitializing) return
  isInitializing = true

  const binariesOk = await checkBinaries()

  if (!binariesOk) {
    if (splashWindow) {
      splashWindow.webContents.send('init-error', 'FFmpeg/FFprobe binaries missing.')
    }
    isInitializing = false // Reset so user can try again if needed
    return
  }

  await detectHardwareAcceleration()

  await new Promise((resolve) => setTimeout(resolve, 2500))

  createMainWindow()

  if (splashWindow) {
    splashWindow.close()
  }

  // No need to reset isInitializing here as the app is moving to the Main Window
})

// Main Window (React) Handlers
ipcMain.on('renderer-ready', () => {
  isRendererReady = true
  // Re-send the hardware status to React UI just in case
  if (mainWindow) mainWindow.webContents.send('log', `🚀 System Ready: Using ${bestEncoder}`)
})

ipcMain.on('app-quit', () => {
  app.quit()
})

ipcMain.handle('select-files', async () => {
  const res = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mkv', 'mov', 'avi'] }]
  })
  return res.filePaths
})

ipcMain.handle('select-output-dir', async () => {
  const res = await dialog.showOpenDialog(mainWindow!, { properties: ['openDirectory'] })
  return res.filePaths[0]
})

ipcMain.handle('open-in-explorer', async (_event, targetPath: string) => {
  if (!targetPath) return
  await shell.openPath(targetPath)
})

ipcMain.on('cancel-file', (_, idx: number) => {
  const proc = activeProcesses.get(idx)
  if (proc) {
    proc.kill()
    activeProcesses.delete(idx)
    safeLog(`❌ Process #${idx} killed`)
  }
})

// ------------------ ENCODING LOGIC ------------------
ipcMain.on('run-encode', async (_, { files, choices, outputDir }) => {
  const resolutions = [
    { name: 'low', size: '426:240', bitrate: '400k', ab: '32k', label: 'l' },
    { name: 'medium', size: '640:360', bitrate: '800k', ab: '32k', label: 'm' },
    { name: 'high', size: '854:480', bitrate: '1200k', ab: '32k', label: 'h' },
    { name: 'veryhigh', size: '1280:720', bitrate: '2400k', ab: '64k', label: 'vh' },
    { name: 'fullhd', size: '1920:1080', bitrate: '4800k', ab: '64k', label: 'fhd' }
  ]

  for (let idx = 0; idx < files.length; idx++) {
    const input = files[idx]
    const fname = parse(input).name.toLowerCase().replace(/\s+/g, '_')
    const outdir = join(outputDir || dirname(input), fname)
    const currentFileDuration = await getVideoDuration(input)

    // Filter down to only what the user selected
    const activeRes = resolutions.filter((_, i) => choices[i] === 'y')
    const selectedNames = activeRes.map((r) => r.name)

    if (activeRes.length === 0 || currentFileDuration === 0) {
      safeLog(`⚠️ Skipping ${fname}: No resolutions selected or invalid duration.`)
      continue
    }

    fs.mkdirSync(outdir, { recursive: true })

    // Build the Filter Complex dynamically
    let filterComplex = `[0:v]fps=25,split=${activeRes.length}`
    activeRes.forEach((_, i) => (filterComplex += `[split${i}]`))
    filterComplex += ';'
    activeRes.forEach((res, i) => {
      filterComplex += `[split${i}]scale=${res.size}[${res.label}];`
    })

    const encodingArgs: string[] = []
    const streamMap: string[] = []

    activeRes.forEach((res, i) => {
      encodingArgs.push(
        '-map',
        `[${res.label}]`,
        '-map',
        '0:a',
        `-c:v:${i}`,
        bestEncoder,
        `-b:v:${i}`,
        res.bitrate,
        `-c:a:${i}`,
        'aac',
        `-b:a:${i}`,
        res.ab,
        '-preset',
        'fast', // Stability
        '-g',
        '50', // Consistent GOP for HLS
        '-sc_threshold',
        '0'
      )
      streamMap.push(`v:${i},a:${i}`)
      fs.mkdirSync(join(outdir, `v${i}`), { recursive: true })
    })

    const ffmpegArgs = [
      '-y',
      ...hwAccelFlag,
      '-i',
      input,
      '-hide_banner', // Cleans up the logs
      '-sn', // Strip subtitles (HLS handles them differently)
      '-map_metadata',
      '-1', // Remove global metadata that can corrupt playlists
      '-filter_complex',
      filterComplex,
      ...encodingArgs,
      '-f',
      'hls',
      '-hls_time',
      '4',
      '-hls_playlist_type',
      'vod',
      '-master_pl_name',
      `${fname}.m3u8`,
      '-hls_segment_filename',
      `${outdir}/v%v/seg%d.ts`,
      '-var_stream_map',
      streamMap.join(' '),
      `${outdir}/v%v/playlist.m3u8`
    ]

    const proc = execa(ffmpegPath, ffmpegArgs)
    activeProcesses.set(idx, proc)
    const startTime = Date.now()

    proc.stderr?.on('data', (d) => {
      const line = d.toString()
      const m = line.match(/time=(\d+):(\d+):([\d.]+)/)
      if (m && currentFileDuration > 0) {
        const elapsed = +m[1] * 3600 + +m[2] * 60 + +m[3]
        const perc = Math.min((elapsed / currentFileDuration) * 100, 100)

        // --- Improved ETA Calculation ---
        const elapsedSec = (Date.now() - startTime) / 1000
        let eta = '...'
        if (perc > 1) {
          const totalTime = elapsedSec / (perc / 100)
          const remain = Math.max(0, totalTime - elapsedSec)
          const mins = Math.floor(remain / 60)
          const secs = Math.floor(remain % 60)
          eta = `${mins}:${secs.toString().padStart(2, '0')}`
        }

        mainWindow?.webContents.send('update-progress', { idx, perc, eta })
      }
    })

    try {
      await proc // Pauses loop until FFmpeg finishes
      await new Promise((r) => setTimeout(r, 1000)) // Wait for file locks
      await handleShellCleanup(outdir, fname, selectedNames)
      mainWindow?.webContents.send('done-file', idx)
      safeLog(`✅ Finished ${fname}`)
      // eslint-disable-next-line
    } catch (error: any) {
      if (!error.killed) safeLog(`❌ Error: ${error.message}`)
    } finally {
      activeProcesses.delete(idx)
    }
  }
})

// ------------------ HELPERS ------------------
async function getVideoDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execa(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath
    ])
    return parseFloat(stdout) || 0
    // eslint-disable-next-line
  } catch (err) {
    safeLog(`❌ Could not get duration for ${filePath}`)
    return 0
  }
}

async function handleShellCleanup(
  outdir: string,
  fname: string,
  selectedNames: string[]
): Promise<void> {
  const masterPl = join(outdir, `${fname}.m3u8`)

  for (let i = 0; i < selectedNames.length; i++) {
    const q = selectedNames[i]
    const sourceVDir = join(outdir, `v${i}`)
    const targetDir = join(outdir, q)

    if (fs.existsSync(sourceVDir)) {
      if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true })
      fs.renameSync(sourceVDir, targetDir)

      // Rename playlist inside folder
      const oldPl = join(targetDir, 'playlist.m3u8')
      const newPl = join(targetDir, `${fname}_${q}.m3u8`)
      if (fs.existsSync(oldPl)) fs.renameSync(oldPl, newPl)

      // Rename segments
      const files = fs.readdirSync(targetDir)
      for (const file of files) {
        if (file.startsWith('seg')) {
          const newName = file.replace('seg', `${fname}_${q}`)
          fs.renameSync(join(targetDir, file), join(targetDir, newName))
        }
      }

      // Update internal paths in the variant playlist
      let content = fs.readFileSync(newPl, 'utf8')
      content = content.replace(/seg/g, `${fname}_${q}`)
      fs.writeFileSync(newPl, content)

      // Update Master Playlist path
      if (fs.existsSync(masterPl)) {
        let masterContent = fs.readFileSync(masterPl, 'utf8')
        masterContent = masterContent.replace(`v${i}/playlist.m3u8`, `${q}/${fname}_${q}.m3u8`)
        fs.writeFileSync(masterPl, masterContent)
      }
    }
  }
}
