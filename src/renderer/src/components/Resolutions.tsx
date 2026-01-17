import { JSX } from 'react'
import { Card, Text, Switch } from '@radix-ui/themes'

const RESOLUTIONS = ['240p', '360p', '480p', '720p', '1080p']

interface Props {
  toggles: boolean[]
  setToggles: React.Dispatch<React.SetStateAction<boolean[]>>
}

export default function ResolutionSelector({ toggles, setToggles }: Props): JSX.Element {
  return (
    <Card size="3">
      <Text as="div" size="3" weight="bold" mb="3">
        Target Resolutions
      </Text>
      <div className="flex flex-wrap gap-4">
        {RESOLUTIONS.map((res, i) => (
          <div key={res} className="flex items-center gap-2  p-2 rounded-lg">
            <Text size="2" weight="medium">
              {res}
            </Text>
            <Switch
              checked={toggles[i]}
              onCheckedChange={() =>
                setToggles((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
              }
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
