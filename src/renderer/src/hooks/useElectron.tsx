import { Progress } from '@renderer/types/ui.types'
import { Dispatch, SetStateAction, useEffect } from 'react'

export default function useElectron({
  setProgress
}: {
  setProgress: Dispatch<SetStateAction<Record<number, Progress>>>
}): void {
  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.rendererReady()

    const onProgress = (data: { idx: number; perc: number; eta?: string }): void => {
      setProgress((prev) => ({
        ...prev,
        [data.idx]: { perc: data.perc, eta: data.eta, done: false }
      }))
    }
    const onDone = (idx: number): void => {
      setProgress((prev) => ({
        ...prev,
        [idx]: { perc: 100, done: true }
      }))
    }

    window.electronAPI.onUpdateProgress(onProgress)
    window.electronAPI.onDoneFile(onDone)

    // 2. Set up the listener for when the user drags the window

    return (): void => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('update-progress')
        window.electron.ipcRenderer.removeAllListeners('done-file')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
