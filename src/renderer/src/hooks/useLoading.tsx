import { Progress } from '@renderer/types/ui.types'
import { Dispatch, SetStateAction, useEffect } from 'react'

interface Props {
  setLoading: Dispatch<SetStateAction<boolean>>
  files: string[]
  progress: Record<number, Progress>
}

export default function useLoading({ setLoading, progress, files }: Props): void {
  useEffect(() => {
    if (files.length === 0) {
      setLoading(false)
      return
    }

    const isEncoding = files.some((_, idx) => {
      const p = progress[idx]
      return p && !p.done
    })

    setLoading(isEncoding)

    // eslint-disable-next-line
  }, [progress, files])
}
