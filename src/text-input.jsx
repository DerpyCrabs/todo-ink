import React from 'react'
import { useInput, useStdin, Text, Color } from 'ink'

const ARROW_LEFT = '\u001B[D'
const ARROW_RIGHT = '\u001B[C'
const ENTER = '\r'
const ESCAPE = '\u001B'
const BACKSPACE = '\x08'
const DELETE = '\x7F'

export const UncontrolledTextInput = ({
  prompt = '',
  placeholder = '',
  value: _value,
  onSubmit,
  onCancel = () => {},
}) => {
  const [value, setValue] = React.useState(_value ? _value : '')
  const [submit, setSubmit] = React.useState(false)
  const [cursorOffset, setCursorOffset] = React.useState(
    _value ? _value.length : 0
  )
  const { setRawMode, stdin } = useStdin()
  const [command, setCommand] = React.useState(null)
  const handleInput = (data) => {
    const s = String(data)
    if (s === ESCAPE) {
      setCommand('escape')
    } else if (s === ENTER) {
      setCommand('submit')
    } else if (s === BACKSPACE || s === DELETE) {
      setCommand('backspace')
    } else if (s === ARROW_LEFT) {
      setCommand('left')
    } else if (s === ARROW_RIGHT) {
      setCommand('right')
    } else {
      setCommand(s)
    }
  }
  React.useEffect(() => {
    if (command === null) return
    if (command === 'backspace') {
      if (cursorOffset === 0) return
      setValue(
        (v) => v.slice(0, cursorOffset - 1) + v.slice(cursorOffset, v.length)
      )
      setCursorOffset((o) => o - 1)
    } else if (command === 'escape') {
      onCancel()
    } else if (command === 'submit') {
      setSubmit(true)
    } else if (command === 'left') {
      setCursorOffset((o) => Math.max(0, o - 1))
    } else if (command === 'right') {
      setCursorOffset((o) => Math.min(value.length, o + 1))
    } else {
      setValue(
        (v) =>
          v.slice(0, cursorOffset) + command + v.slice(cursorOffset, v.length)
      )
      setCursorOffset((o) => o + command.length)
    }
    setCommand(null)
  }, [command])
  React.useEffect(() => {
    if (submit) onSubmit(value)
  }, [submit])
  React.useLayoutEffect(() => {
    setRawMode(true)
    stdin.on('data', handleInput)
    return () => {
      stdin.removeListener('data', handleInput)
      setRawMode(false)
    }
  }, [])
  return (
    <Text>
      {prompt}
      {value === '' && _value === undefined && placeholder ? (
        <Color dim>{placeholder}</Color>
      ) : (
        <>
          {Array.from(value).map((v, i) =>
            i === cursorOffset ? (
              <Color dim key={i}>
                {v}
              </Color>
            ) : (
              <Color key={i}>{v}</Color>
            )
          )}
          {cursorOffset === value.length && <Color dim>_</Color>}
        </>
      )}
    </Text>
  )
}
