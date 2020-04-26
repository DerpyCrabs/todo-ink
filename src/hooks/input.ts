import { useInput } from 'ink'
import type { Key as KeyWithoutBackspace } from 'ink'

export interface Key extends KeyWithoutBackspace {
  backspace: boolean
}

export type Handler = (input: string, key: Key) => void

const handleBackspace = (handler: Handler) => (
  input: string,
  key: KeyWithoutBackspace
): void => {
  if (input === '\x08' || input === '\x7F') {
    handler(input, { ...key, backspace: true })
  } else {
    handler(input, { ...key, backspace: false })
  }
}
const useInputFix = (handler: Handler, options = { active: true }) =>
  useInput(handleBackspace(handler), { isActive: options.active })

export default useInputFix
