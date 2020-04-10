import React from 'react'
import { useInput, useStdin, Text } from 'ink'

const ARROW_LEFT = '\u001B[D'
const ARROW_RIGHT = '\u001B[C'
const ENTER = '\r'
const ESCAPE = '\u001B'
const BACKSPACE = '\x08'
const DELETE = '\x7F'

export const UncontrolledTextInput = ({
  prompt = '',
  onSubmit,
  onCancel = () => {},
}) => {
  const [value, setValue] = React.useState('')
  const [submit, setSubmit] = React.useState(false)
  const { setRawMode, stdin } = useStdin()
  const handleInput = (data) => {
    const s = String(data)
    if (s === ESCAPE) {
      onCancel()
    } else if (s === ENTER) {
      setSubmit(true)
    } else if (s === BACKSPACE || s === DELETE) {
      setValue((v) => v.slice(0, v.length - 1))
    } else {
      setValue((v) => v + s)
    }
  }
  React.useEffect(() => {
    if (submit) onSubmit(value)
  }, [submit])
  React.useEffect(() => {
    setRawMode(true)
    stdin.on('data', handleInput)
    return () => {
      stdin.removeListener('data', handleInput)
      setRawMode(false)
    }
  }, [])
  return (
    <>
      <Text>
        {prompt}
        {value}
      </Text>
    </>
  )
}
