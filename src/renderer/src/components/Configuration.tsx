import { Card, Text, Button } from '@radix-ui/themes'
import { Progress } from '@renderer/types/ui.types'
import { FileVideo, Folder } from 'lucide-react'
import { Dispatch, JSX, SetStateAction } from 'react'

export default function Configuration({
  setFiles,
  setProgress,
  files,
  outputDir
}: {
  setFiles: Dispatch<SetStateAction<string[]>>
  setProgress: Dispatch<SetStateAction<Record<number, Progress>>>
  files: string[]
  outputDir: string | null
}): JSX.Element {
  const selectFiles = async (): Promise<void> => {
    const selected = await window.electronAPI.selectFiles()
    if (selected?.length) {
      setFiles(selected)
      setProgress({})
    }
  }

  const openOutputDir = async (): Promise<void> => {
    if (outputDir) {
      await window.electronAPI.openInExplorer(outputDir)
    } else {
      alert('You are using the source folder as output folder.')
    }
  }

  return (
    <Card size="3">
      <Text as="div" size="3" weight="bold" mb="3">
        Configuration
      </Text>
      <div className="flex flex-col gap-3">
        <Button onClick={selectFiles} variant="soft" className="cursor-pointer">
          <FileVideo size={16} /> Select Source Videos
        </Button>
        <Button
          onClick={openOutputDir}
          variant="soft"
          color="gray"
          className="cursor-pointer w-full max-w-75" // Set a width limit here
        >
          <div className="flex items-center gap-2 w-full min-w-0">
            <Folder size={16} className="shrink-0" /> {/* Prevents icon from squishing */}
            <Text as="div" size="2" className="truncate min-w-0 flex-1">
              {outputDir ?? 'Source folder'}
            </Text>
          </div>
        </Button>

        <div className="flex flex-col mt-2 p-3 rounded-md gap-2">
          <Text as="div" size="1" weight="bold" color="gray" className="uppercase mb-1">
            Status
          </Text>
          <div className="flex flex-row items-center gap-1">
            <FileVideo size={18} />
            <Text as="div" size="2" className="truncate">
              {files.length} files selected
            </Text>
          </div>
        </div>
      </div>
    </Card>
  )
}
