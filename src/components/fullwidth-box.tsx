import { Box } from 'ink'
import React from 'react'
import { useStdoutSize } from '../utils'

export default function FullwidthBox({
  children,
  indentation = 0,
}: {
  children: React.ReactNode
  indentation?: number
}) {
  const { columns } = useStdoutSize()

  return (
    <Box textWrap='truncate-end' width={columns - indentation * 3 - 1}>
      {' '.repeat(indentation * 3)}
      {children}
    </Box>
  )
}
