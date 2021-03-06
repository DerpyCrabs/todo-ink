import { Box, Text } from 'ink'
import React from 'react'
import { useStdoutSize } from '../utils'

export default function ScrollableList({
  children,
  position,
  margin = 0,
}: {
  children: React.ReactNode
  position: number | null
  margin: number
}) {
  const [focus, setFocus] = React.useState(0)
  const { rows: _rows } =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    process.env.NODE_ENV === 'test' ? { rows: 10 } : useStdoutSize()
  const rows = _rows - margin
  const childrenArray = React.Children.toArray(children)
  React.useEffect(() => {
    setFocus((focus) => {
      if (position === null) {
        return focus
      }
      if (focus > 0) {
        if (position - 1 < focus) {
          return Math.max(0, focus - (focus - position + 1))
        }
      }
      if (childrenArray.length > focus + rows) {
        if (focus + rows - 1 < position + 1) {
          return focus + (position + 1 - (focus + rows - 1))
        }
      }
      return focus
    })
  }, [rows, position, childrenArray.length, setFocus])

  React.useEffect(() => {
    if (rows >= childrenArray.length) {
      setFocus(0)
    }
  }, [rows, childrenArray.length])

  if (childrenArray.length === 0) {
    return <Box minHeight={rows} />
  }

  return (
    <Box flexDirection='column' minHeight={rows}>
      {focus > 0 ? <Text>...</Text> : childrenArray[0]}
      {childrenArray.slice(focus + 1, focus + rows - 1)}
      {childrenArray.length > focus + rows ? (
        <Text>...</Text>
      ) : (
        childrenArray[focus + rows - 1]
      )}
    </Box>
  )
}
