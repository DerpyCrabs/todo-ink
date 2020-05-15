import { Box } from 'ink'
import { dropLast } from 'ramda'
import React from 'react'
import { NoteType, useTasks } from '../hooks/tasks'
import { folderPathString, taskPath } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function NoteHeader({ note }: { note: NoteType }) {
  const { root } = useTasks()
  return (
    <Box flexDirection='column'>
      <FullwidthBox>Note: {note.name}</FullwidthBox>
      <FullwidthBox>
        Folder:{' /'}
        {folderPathString(root, dropLast(2, taskPath(root, note.id)))}
      </FullwidthBox>
      <FullwidthBox>Creation date: {note.creationDate}</FullwidthBox>
      <FullwidthBox>Modification date: {note.modificationDate}</FullwidthBox>
      <Box> </Box>
    </Box>
  )
}
