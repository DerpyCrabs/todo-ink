import { Box, Text } from 'ink'
import { dropLast } from 'ramda'
import React from 'react'
import { NoteType, useTasks } from '../hooks/tasks'
import { folderPathString, formatDate, taskPath } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function NoteHeader({ note }: { note: NoteType }) {
  const { root } = useTasks()
  return (
    <Box flexDirection='column'>
      <FullwidthBox>
        <Text>Note: {note.name}</Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>
          Folder:{' /'}
          {folderPathString(root, dropLast(2, taskPath(root, note.id)))}
        </Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>Creation date: {formatDate(note.creationDate)}</Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>Modification date: {formatDate(note.modificationDate)}</Text>
      </FullwidthBox>
    </Box>
  )
}
