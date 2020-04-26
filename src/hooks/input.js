import { useEffect, useContext } from 'react'
import { StdinContext } from 'ink'

export default (inputHandler, { active = true } = {}) => {
  const { stdin, setRawMode } = useContext(StdinContext)

  useEffect(() => {
    if (!active) {
      return
    }

    setRawMode(true)

    return () => {
      setRawMode(false)
    }
  }, [active, setRawMode])

  useEffect(() => {
    if (!active) {
      return
    }

    const handleData = (data) => {
      let input = String(data)
      const key = {
        upArrow: input === '\u001B[A',
        downArrow: input === '\u001B[B',
        leftArrow: input === '\u001B[D',
        rightArrow: input === '\u001B[C',
        return: input === '\r',
        escape: input === '\u001B',
        backspace: input === '\x08',
        deleteKey: input === '\x7F',
        ctrl: false,
        shift: false,
        meta: false,
      }

      // Copied from `keypress` module
      if (input <= '\u001A' && !key.return) {
        input = String.fromCharCode(input.charCodeAt(0) + 'a'.charCodeAt(0) - 1)
        key.ctrl = true
      }

      if (input[0] === '\u001B') {
        input = input.slice(1)
        key.meta = true
      }

      const isLatinUppercase = input >= 'A' && input <= 'Z'
      const isCyrillicUppercase = input >= 'А' && input <= 'Я'
      if (input.length === 1 && (isLatinUppercase || isCyrillicUppercase)) {
        key.shift = true
      }

      inputHandler(input, key)
    }

    stdin.on('data', handleData)

    return () => {
      stdin.off('data', handleData)
    }
  }, [active, stdin, inputHandler])
}