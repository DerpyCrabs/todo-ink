import useInput from './use-input'

export default function useHotkeys(hotkeys, active = true) {
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
