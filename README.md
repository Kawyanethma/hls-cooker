# HLS Cooker

HLS Cooker is a batch-processing application for generating HTTP Live Streaming (HLS) formats from video files. It's designed to provide a streamlined, user-friendly experience for encoding media files into various resolutions and formats, leveraging hardware acceleration where available.

<img width="900" height="800" alt="Screenshot 2026-01-17 140521" src="https://github.com/user-attachments/assets/33749912-3024-46b4-9fac-122aa447a898" />

---

## Features

- **Batch Video Processing**: Select multiple video files for encoding.
- **Flexible Resolution Settings**: Choose from a range of target resolutions, including 240p, 360p, 480p, 720p, and 1080p.
- **System Logs**: Monitor processing steps and system readiness directly in-app.
- **Hardware Acceleration**: Utilize hardware encoding when supported, with fallback to software using `libx264` if necessary.
- **Cross-Platform Build**: Available for Windows, macOS, and Linux.

---

## Installation

#### Windows
- Download the installer file for Windows (`hls-cooker-setup.exe`) and run it.
- The installer creates desktop shortcuts automatically.

#### macOS
- Download the DMG file and open it.
- Drag the HLS Cooker app into your Applications folder.

#### Linux
- Supported Linux formats:
  - AppImage (`hls-cooker.AppImage`)
  - Snap package
  - Debian package (`hls-cooker.deb`)
- Install or execute the format that best suits your distribution.

---

## Usage

1. **Select Source Videos**: Use the Configuration panel to choose your video files or source folder.
2. **Configure Resolutions**: Toggle target resolutions to specify encoding outputs (e.g., 240p & 720p).
3. **Start Encoding**: Begin processing by pressing the "Start Encoding" button.

---

## Build and Development

The application is built using [Electron](https://www.electronjs.org/), offering easy packaging across platforms. Configuration settings can be found in the `electron-builder.yml` file.

#### System Requirements:
- FFmpeg and FFprobe binaries are packaged within the application to support media processing tasks.

Below is a snippet of the build configuration:

```yaml
appId: com.evohls.app
productName: HLS Cooker
asar: true
extraResources:
  - from: node_modules/ffmpeg-static
    to: ffmpeg-static
  - from: node_modules/ffprobe-static
    to: ffprobe-static
win:
  executableName: hls-cooker
linux:
  target:
    - AppImage
    - snap
    - deb
mac:
  notarize: false
```

---

## Contributors

Developed by **Kawyanethma Walisundara**

---

## License

Distributed under [LICENSE]. See `LICENSE` file for details.
