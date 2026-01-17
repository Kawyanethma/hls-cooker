import { Button, Dialog, IconButton, Switch } from '@radix-ui/themes'
import { useAppTheme } from '@renderer/ThemeProvider'
import { Settings2 } from 'lucide-react'
import { Dispatch, JSX, SetStateAction } from 'react'

export default function Settings({
  outputDir,
  setOutputDir
}: {
  outputDir: string | null
  setOutputDir: Dispatch<SetStateAction<string | null>>
}): JSX.Element {
  const { theme, setTheme } = useAppTheme()

  const selectOutputDir = async (): Promise<void> => {
    const dir = await window.electronAPI.selectOutputDir()
    if (dir) {
      localStorage.setItem('outputDir', dir)
      setOutputDir(dir)
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="ghost" color="gray" radius="full">
          <Settings2 size={20} />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Settings</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Manage your application preferences and output destinations.
        </Dialog.Description>

        <div className="flex flex-col gap-6">
          {/* Directory Selection Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-11">Output Directory</label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-1.5 bg-slate-3 border border-slate-6 rounded-md text-sm truncate">
                {outputDir ?? 'Source Directory'}
              </div>
              <Button variant="outline" onClick={selectOutputDir}>
                Browse
              </Button>
            </div>
          </div>

          {/* Theme Selection Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-12">Dark Mode</label>
              <span className="text-xs text-slate-11">Adjust the appearance of the interface</span>
            </div>
            {/* Replace with your Switch component */}
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        <div className="pt-8 flex justify-end gap-3">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
