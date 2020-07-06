import { Box, Text } from 'ink'
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
    <Box width={columns - 1}>
      <Text wrap='truncate-end'>
        {' '.repeat(indentation * 3)}
        {children}
      </Text>
    </Box>
  )
}
