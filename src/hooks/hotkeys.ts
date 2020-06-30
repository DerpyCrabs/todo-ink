import { Key, useInput } from 'ink'

export type Hotkey = (key: Key, input: string) => boolean
type HotkeyHandler = [Hotkey, () => void]

export default function useHotkeys(
  hotkeys: Array<HotkeyHandler>,
  isActive = true
): void {
  useInput(
    (input, key) => {
      if (isActive) {
        for (const [hotkey, handler] of hotkeys) {
          if (hotkey(key, input)) {
            handler()
          }
        }
      }
    },
    { isActive }
  )
}
