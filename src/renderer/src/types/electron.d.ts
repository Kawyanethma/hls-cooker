export {}

declare global {
  interface Window {
    electronAPI: {
      selectFiles: () => Promise<string[]>
      selectOutputDir: () => Promise<string>
      openInExplorer: (targetPath: string) => Promise<void>
      runEncode: (data: { files: string[]; choices: string[]; outputDir: string | null }) => void
      cancelFile: (idx: number) => void
      onLog: (cb: (msg: string) => void) => void
      onUpdateProgress: (cb: (data: { idx: number; perc: number; eta?: string }) => void) => void
      onDoneFile: (cb: (idx: number) => void) => void
      rendererReady: () => void
    }
  }
}
