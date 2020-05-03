import { Box } from 'ink'
import React from 'react'
import { useStdoutSize } from '../utils'

export default function FullwidthBox({
  children,
}: {
  children: React.ReactNode
}) {
  const { columns } = useStdoutSize()

  return (
    <Box textWrap='truncate-end' width={columns - 1}>
      {children}
    </Box>
  )
}
