import React from 'react'
import { render, Box, useInput, useApp, Color } from 'ink'

const TodoInk = () => {
  const { exit } = useApp()
  const [text, setText] = React.useState('')
  useInput((input, key) => {
    if (key.escape) {
      exit()
      return
    }
    setText(text + input)
  })

  return (
    <Box>
      <Color green>Input: {text}</Color>
    </Box>
  )
}

render(<TodoInk />)
