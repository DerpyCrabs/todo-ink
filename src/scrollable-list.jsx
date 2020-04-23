import React from 'react'
import { Box, useStdout } from 'ink'

const useStdoutSize = () => {
  const { stdout } = useStdout()
  const [size, setSize] = React.useState({
    columns: stdout.columns,
    rows: stdout.rows,
  })

  React.useEffect(() => {
    const handler = () =>
      setSize({ columns: stdout.columns, rows: stdout.rows })
    stdout.on('resize', handler)
    return () => {
      stdout.off('resize', handler)
    }
  }, [stdout, stdout.columns, stdout.rows])

  return size
}

export default function ScrollableList({ children, position, margin = 0 }) {
  const [focus, setFocus] = React.useState(0)
  const { rows: _rows } = useStdoutSize()
  let rows = _rows - margin
  if (React.Children.count(children) > focus + rows + 1 && focus > 0) {
    rows -= 2
  } else if (React.Children.count(children) > focus + rows + 1) {
    rows -= 1
  } else if (focus > 0) {
    rows -= 1
  }

  React.useEffect(() => {
    if (position === null) {
      return
    }
    if (position > rows + focus - 1) {
      setFocus(focus + (position - (focus + rows) + 1))
    } else if (position < focus) {
      setFocus(focus - (focus - position))
    }
  }, [rows, position])

  return (
    <Box flexDirection='column' minHeight={rows}>
      {focus > 0 && '...'}
      {React.Children.toArray(children).slice(focus, focus + rows)}
      {React.Children.count(children) > focus + rows + 2 && '...'}
    </Box>
  )
}
