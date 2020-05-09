import { Box, Color } from 'ink'
import { defaultTo } from 'ramda'
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

// eslint-disable-next-line react/display-name
export const ControlledTextInput = React.memo(
  ({ prompt = '', placeholder = '', value, onChange }: ControlledTextInput) => {
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
      } else if (key.downArrow || key.upArrow) {
        return
      } else {
        setCursorOffset((o) => o + input.length)
        onChange(
          value.slice(0, cursorOffset) +
            input +
            value.slice(cursorOffset, value.length)
        )
      }
    })

    return (
      <Box textWrap='truncate-start'>
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
      </Box>
    )
  }
)

export const UncontrolledTextInput = ({
  prompt = '',
  placeholder = '',
  value: _value,
  onSubmit,
  onCancel = () => {},
}: UncontrolledTextInput) => {
  const [state, dispatch] = React.useReducer(
    (
      state: { cursor: number; value: string },
      action: {
        type: 'removeCharacter' | 'moveLeft' | 'moveRight' | 'input'
        input?: string
      }
    ) => {
      switch (action.type) {
        case 'removeCharacter':
          if (state.cursor === 0) return state
          return {
            value:
              state.value.slice(0, state.cursor - 1) +
              state.value.slice(state.cursor, state.value.length),
            cursor: state.cursor - 1,
          }
        case 'moveLeft':
          return { ...state, cursor: Math.max(0, state.cursor - 1) }
        case 'moveRight':
          return {
            ...state,
            cursor: Math.min(state.value.length, state.cursor + 1),
          }
        case 'input':
          if (action.input === undefined) return state
          return {
            cursor: state.cursor + action.input.length,
            value:
              state.value.slice(0, state.cursor) +
              action.input +
              state.value.slice(state.cursor, state.value.length),
          }
      }
      return state
    },
    {
      cursor: defaultTo('', _value).length,
      value: defaultTo('', _value),
    }
  )

  useInput((input, key) => {
    if (key.escape) {
      onCancel()
    } else if (key.return) {
      onSubmit(state.value)
    } else if (key.backspace) {
      dispatch({ type: 'removeCharacter' })
    } else if (key.leftArrow) {
      dispatch({ type: 'moveLeft' })
    } else if (key.rightArrow) {
      dispatch({ type: 'moveRight' })
    } else {
      dispatch({ type: 'input', input })
    }
  })

  return (
    <Box textWrap='truncate-start'>
      {prompt}
      {state.value === '' && placeholder ? (
        <Color dim>{placeholder}</Color>
      ) : (
        <>
          {Array.from(state.value).map((v, i) =>
            i === state.cursor ? (
              <Color dim key={i}>
                {v}
              </Color>
            ) : (
              <Color key={i}>{v}</Color>
            )
          )}
          {state.cursor === state.value.length && <Color dim>_</Color>}
        </>
      )}
    </Box>
  )
}

export default React.memo(UncontrolledTextInput)
