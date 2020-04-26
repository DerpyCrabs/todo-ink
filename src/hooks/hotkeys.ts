import useInput from './input'
import type { Key } from './input'

type Hotkey = [(key: Key, input: string) => boolean, () => void]

export default function useHotkeys(hotkeys: [Hotkey], active = true) {
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
