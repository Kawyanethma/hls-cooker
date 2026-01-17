import { JSX } from 'react'
import { FileVideo, XCircle } from 'lucide-react'
import { Card, Text, Badge, IconButton, Progress as RadixProgress } from '@radix-ui/themes'
import { Progress } from '@renderer/types/ui.types'

interface EncodingQueueProps {
  files: string[]
  progress: Record<number, Progress>
  cancelFile: (index: number) => void
}

export default function EncodingQueue({
  files,
  progress,
  cancelFile
}: EncodingQueueProps): JSX.Element {
  return (
    <Card size="3" className="flex-1">
      <Text as="div" size="3" weight="bold" mb="4">
        Encoding Queue
      </Text>
      <div className="flex flex-col gap-4 max-h-75 overflow-y-auto pr-2">
        {files.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center border-2 border-dashed rounded-xl border-orange-200 gap-4">
            <FileVideo size={48} color="gray" />
            <Text color="gray">Queue is empty. Select files to begin.</Text>
          </div>
        )}
        {files.map((f, i) => {
          const p = progress[i]
          const fileName = f.split(/[\\/]/).pop()
          return (
            <div key={i} className="border border-gray-300 rounded-lg p-3 gap-4">
              <div className="flex justify-between items-center pb-2">
                <Text size="2" weight="bold" className="truncate max-w-[70%]">
                  {fileName}
                </Text>
                <div className="flex items-center gap-4">
                  {p?.done ? (
                    <Badge color="green">Done</Badge>
                  ) : p ? (
                    <Badge color="blue">Processing</Badge>
                  ) : (
                    <Badge color="gray">Waiting</Badge>
                  )}
                  {!p?.done && (
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="red"
                      radius="full"
                      onClick={() => cancelFile(i)}
                    >
                      <XCircle size={16} />
                    </IconButton>
                  )}
                </div>
              </div>

              <RadixProgress value={p?.perc ?? 0} color={p?.done ? 'green' : 'blue'} size="2" />

              <div className="flex justify-between pt-2">
                <Text size="1" color="gray">
                  {p ? `${p.perc.toFixed(1)}%` : '0%'}
                </Text>
                {p?.eta && !p.done && (
                  <Text size="1" color="gray">
                    ETA: {p.eta}
                  </Text>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
