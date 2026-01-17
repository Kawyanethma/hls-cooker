import { Card, Text, Button, useThemeContext } from '@radix-ui/themes'
import { Terminal } from 'lucide-react'
import { JSX, useEffect, useRef, useState } from 'react'

export default function Logs(): JSX.Element {
  const [logs, setLogs] = useState<string[]>([])
  const theme = useThemeContext()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.rendererReady()

    const onLog = (msg: string): void => {
      setLogs((prev) => (prev.includes(msg) ? prev : [...prev, msg]))
    }
    window.electronAPI.onLog(onLog)

    return (): void => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('log')
      }
    }
  }, [])

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    })
  }, [logs])

  return (
    <Card size="2" className="bg-slate-900 border-none shadow-inner">
      <div
        className={`flex items-center justify-between gap-2 mb-2 ${theme.appearance === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
      >
        <div className="flex flex-row">
          <Terminal size={18} />
          <Text size="1" weight="bold" className="uppercase tracking-widest">
            System Logs
          </Text>
        </div>
        <Button
          size="1"
          color="gray"
          className="uppercase tracking-widest"
          onClick={() => {
            setLogs([])
          }}
        >
          Clear
        </Button>
      </div>
      <div className="h-32 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col pt-2">
        {logs.length === 0 && (
          <Text
            color="gray"
            className={`italic opacity-50 ${
              theme.appearance === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            No logs yet...
          </Text>
        )}
        {logs.map((l, i) => (
          <div
            ref={i === logs.length - 1 ? ref : null}
            key={i}
            className={
              l.toLowerCase().includes('error')
                ? theme.appearance === 'dark'
                  ? 'text-red-400'
                  : 'text-red-800'
                : theme.appearance === 'dark'
                  ? 'text-green-400'
                  : 'text-green-800'
            }
          >
            <span className="opacity-50 mr-2 text-slate-500">
              [{new Date().toLocaleTimeString()}]
            </span>
            <span className="mr-2 opacity-70">$</span>
            {l}
          </div>
        ))}
      </div>
    </Card>
  )
}
