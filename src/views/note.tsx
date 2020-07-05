import { edit } from 'external-editor'
import { Box, Text } from 'ink'
import React from 'react'
import NoteHeader from '../components/note-header'
import TaskDescription from '../components/task-description'
import { isEdit, isLeave } from '../constants/hotkeys'
import { useErrorDialog } from '../hooks/error-dialog'
import useHotkeys from '../hooks/hotkeys'
import { RouteProps, useRouter } from '../hooks/router'
import type { TaskId } from '../hooks/tasks'
import { useNote } from '../hooks/tasks'

export default function NoteView({ id }: { id: TaskId } & RouteProps) {
  const { note, setNote } = useNote(id)
  const { back } = useRouter()
  const { showError } = useErrorDialog()

  // prettier-ignore
  useHotkeys([
    [isLeave, () => {
      back()
      },],
    [isEdit, () => {
      try {
        setNote({...note, description: edit(note.description, { postfix: '.md' })})
      } catch (e) {
        showError(`Failed to open external editor: ${JSON.stringify(e)}`)
      }
      },],
    ], true)

  return (
    <Box flexDirection='column'>
      <NoteHeader note={note} />
      {note.description !== '' ? (
        <TaskDescription description={note.description} margin={6} />
      ) : (
        <Text>No description. Press {`'e'`} to open description editor</Text>
      )}
    </Box>
  )
}
