import { Color, Text } from 'ink'
import React from 'react'
import useInput from '../hooks/input'

interface TextInput {
  prompt?: string
  value?: string
  placeholder?: string
}
interface ControlledTextInput extends TextInput {
  value: string
  onChange: (value: string) => void
}
interface UncontrolledTextInput extends TextInput {
  onSubmit: (value: string) => void
  onCancel: () => void
}

export const ControlledTextInput = ({
  prompt = '',
  placeholder = '',
  value,
  onChange,
}: ControlledTextInput) => {
  const [cursorOffset, setCursorOffset] = React.useState(value.length)

  useInput((input, key) => {
    if (key.backspace) {
      if (cursorOffset === 0) return
      onChange(
        value.slice(0, cursorOffset - 1) +
          value.slice(cursorOffset, value.length)
      )
      setCursorOffset((o) => o - 1)
    } else if (key.leftArrow) {
      setCursorOffset((o) => Math.max(0, o - 1))
    } else if (key.rightArrow) {
      setCursorOffset((o) => Math.min(value.length, o + 1))
    } else {
      onChange(
        value.slice(0, cursorOffset) +
          input +
          value.slice(cursorOffset, value.length)
      )
      setCursorOffset((o) => o + input.length)
    }
  })

  return (
    <Text>
      {prompt}
      {value === '' && placeholder ? (
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

export const UncontrolledTextInput = ({
  prompt = '',
  placeholder = '',
  value: _value,
  onSubmit,
  onCancel = () => {},
}: UncontrolledTextInput) => {
  const [value, setValue] = React.useState(_value ? _value : '')

  useInput((input, key) => {
    if (key.escape) {
      onCancel()
    } else if (key.return) {
      onSubmit(value)
    }
  })

  return (
    <ControlledTextInput
      prompt={prompt}
      placeholder={placeholder}
      value={value}
      onChange={setValue}
    />
  )
}

export default UncontrolledTextInput
