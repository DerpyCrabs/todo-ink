import useInput from './input'
import type { Key } from './input'

export type Hotkey = (key: Key, input: string) => boolean
type HotkeyHandler = [Hotkey, () => void]

export default function useHotkeys(
  hotkeys: Array<HotkeyHandler>,
  active = true
): void {
  useInput(
    (input, key) => {
      if (active) {
        for (const [hotkey, handler] of hotkeys) {
          if (hotkey(key, input)) {
            handler()
          }
        }
      }
    },
    { active }
  )
}
