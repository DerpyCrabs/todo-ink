import { useInput } from 'ink'
import type { Key as KeyWithoutBackspace } from 'ink'

export interface Key extends KeyWithoutBackspace {
  backspace: boolean
}

type InputHandler = (input: string, key: KeyWithoutBackspace) => void

export type Handler = (input: string, key: Key) => void

const handleBackspace = (handler: InputHandler) => (
  input: string,
  key: Key
) => {
  if (input === '\x08' || input === '\x7F') {
    return handler(input, { ...key, backspace: true })
  } else {
    return handler(input, { ...key, backspace: false })
  }
}
const useInputFix = (handler: Handler, options = { active: true }) =>
  useInput(handleBackspace(handler), { isActive: options.active })

export default useInputFix
