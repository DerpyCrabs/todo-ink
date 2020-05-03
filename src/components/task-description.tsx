import { Box } from 'ink'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import React from 'react'
import { useStdoutSize } from '../utils'

export default function TaskDescription({
  description,
}: {
  description: string
}) {
  const { rows } = useStdoutSize()
  marked.setOptions({
    renderer: new TerminalRenderer({ width: rows, reflowText: true }),
  })
  return <Box>{JSON.stringify(marked(description).trim())}</Box>
}
