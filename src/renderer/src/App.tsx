import { JSX, useState } from 'react'
import { Button } from '@radix-ui/themes'
import { Play } from 'lucide-react'

import Logo from '@renderer/components/Logo'
import Logs from '@renderer/components/Logs'
import { Progress } from '@renderer/types/ui.types'
import useLoading from '@renderer/hooks/useLoading'
import useElectron from '@renderer/hooks/useElectron'
import Configuration from '@renderer/components/Configuration'
import EncodingQueue from '@renderer/components/EncodingQueue'
import ResolutionSelector from '@renderer/components/Resolutions'
import Settings from './components/Settings'

function App(): JSX.Element {
  const [files, setFiles] = useState<string[]>([])
  const [outputDir, setOutputDir] = useState<string | null>(() => localStorage.getItem('outputDir'))
  const [toggles, setToggles] = useState<boolean[]>([true, true, true, true, true])
  const [progress, setProgress] = useState<Record<number, Progress>>({})
  const [loading, setLoading] = useState(false)

  useElectron({ setProgress })
  useLoading({ setLoading, progress, files })

  const startEncode = (): void => {
    setLoading(true)
    if (!files.length) {
      alert('Please select files first')
      return
    }
    const choices = toggles.map((v) => (v ? 'y' : 'n'))
    window.electronAPI.runEncode({ files, choices, outputDir })
  }

  const cancelFile = (idx: number): void => {
    window.electronAPI.cancelFile(idx)
    setProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[idx]
      return newProgress
    })
    setLoading(false)
    setFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(idx, 1)
      return newFiles
    })
  }

  return (
    <div className="p-10 flex flex-col gap-6 font-sans w-full h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Logo />
        <Settings outputDir={outputDir} setOutputDir={setOutputDir} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Config */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <Configuration
            setFiles={setFiles}
            setProgress={setProgress}
            files={files}
            outputDir={outputDir}
          />
          <ResolutionSelector toggles={toggles} setToggles={setToggles} />
          <Button
            size="4"
            loading={loading}
            onClick={startEncode}
            disabled={files.length === 0 || toggles.every((t) => !t) || loading}
            className="w-full cursor-pointer"
          >
            <Play size={18} fill="currentColor" /> START ENCODING
          </Button>
        </div>

        {/* Right Column: Progress & Logs */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <EncodingQueue files={files} progress={progress} cancelFile={cancelFile} />
          <Logs />
        </div>
      </div>
    </div>
  )
}

export default App
