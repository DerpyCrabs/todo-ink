import { Color, Text } from 'ink'
import React from 'react'
import useInput from '../hooks/input'

export const UncontrolledTextInput = ({
  prompt = '',
  placeholder = '',
  value: _value,
  onSubmit,
  onCancel = () => {},
}) => {
  const [value, setValue] = React.useState(_value ? _value : '')
  const [cursorOffset, setCursorOffset] = React.useState(
    _value ? _value.length : 0
  )

  useInput((input, key) => {
    if (key.backspace) {
      if (cursorOffset === 0) return
      setValue(
        (v) => v.slice(0, cursorOffset - 1) + v.slice(cursorOffset, v.length)
      )
      setCursorOffset((o) => o - 1)
    } else if (key.escape) {
      onCancel()
    } else if (key.return) {
      onSubmit(value)
    } else if (key.leftArrow) {
      setCursorOffset((o) => Math.max(0, o - 1))
    } else if (key.rightArrow) {
      setCursorOffset((o) => Math.min(value.length, o + 1))
    } else {
      setValue(
        (v) =>
          v.slice(0, cursorOffset) + input + v.slice(cursorOffset, v.length)
      )
      setCursorOffset((o) => o + input.length)
    }
  })

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
