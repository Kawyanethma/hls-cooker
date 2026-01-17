import React, { JSX, useEffect, useState } from 'react'
import './assets/main.css'

export function SplashApp(): JSX.Element {
  const [status, setStatus] = useState('Initializing...')
  const hasSentReady = React.useRef(false) // 👈 Track state across renders

  useEffect(() => {
    // Listen for logs
    const logHandler = (_: unknown, msg: string): void => setStatus(msg)
    window.electron.ipcRenderer.on('log', logHandler)

    // Only send the signal ONCE, even if React mounts twice
    if (!hasSentReady.current) {
      window.electron.ipcRenderer.send('splash-ready')
      hasSentReady.current = true
    }

    return () => {
      window.electron.ipcRenderer.removeListener('log', logHandler)
    }
  }, [])
  return (
    <div className="splash-card">
      <div className="splash-body">
        <h1 className="logo">
          HLS <span>Cooker</span>
          <p className="logo-subtext">Developed by Kawyanethma Walisundara</p>
        </h1>
        <div className="spinner"></div>
        <p className="status-text">{status}</p>
      </div>
      <p className="copy-write-text">© {new Date().getFullYear()} Evoke International Limited</p>
    </div>
  )
}
