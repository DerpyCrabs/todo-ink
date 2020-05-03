import { Box } from 'ink'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import React from 'react'
import { isSelectNext, isSelectPrev } from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'
import { useStdoutSize } from '../utils'
import ScrollableList from './scrollable-list'

export default function TaskDescription({
  description,
  margin,
}: {
  description: string
  margin: number
}) {
  const { columns } = useStdoutSize()
  marked.setOptions({
    renderer: new TerminalRenderer({ width: columns - 3, reflowText: true }),
  })
  const lines = marked(description).split('\n')

  const [position, setPosition] = React.useState(0)
  React.useEffect(() => {
    setPosition(0)
  }, [description])

  // prettier-ignore
  useHotkeys([
    [isSelectNext, () => {
        if (position !== lines.length - 1) {
          setPosition(position + 1)
        }
      },],
    [isSelectPrev, () => {
        if (position !== 0) {
          setPosition(position - 1)
        }
      },],
    ], true)

  return (
    <ScrollableList margin={margin} position={position}>
      {lines.map((line, i) => (
        <Box width={columns}>
          {i === position ? '> ' : '  '}
          {line}
        </Box>
      ))}
    </ScrollableList>
  )
}
