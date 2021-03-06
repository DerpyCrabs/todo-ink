import { edit } from 'external-editor'
import { Box, Text } from 'ink'
import React from 'react'
import TaskDescription from '../components/task-description'
import TaskHeader from '../components/task-header'
import { isEdit, isLeave } from '../constants/hotkeys'
import { useErrorDialog } from '../hooks/error-dialog'
import useHotkeys from '../hooks/hotkeys'
import { RouteProps, useRouter } from '../hooks/router'
import type { TaskId } from '../hooks/tasks'
import { useTask } from '../hooks/tasks'

export default function TaskView({ id }: { id: TaskId } & RouteProps) {
  const { task, setTask } = useTask(id)
  const { back } = useRouter()
  const { showError } = useErrorDialog()

  // prettier-ignore
  useHotkeys([
    [isLeave, () => {
      back()
      },],
    [isEdit, () => {
      try {
        setTask({...task, description: edit(task.description, { postfix: '.md' })})
      } catch (e) {
        showError(`Failed to open external editor: ${JSON.stringify(e)}`)
      }
      },],
    ], true)

  return (
    <Box flexDirection='column'>
      <TaskHeader task={task} />
      <Box marginTop={1}>
        {task.description !== '' ? (
          <TaskDescription description={task.description} margin={6} />
        ) : (
          <Text>No description. Press {`'e'`} to open description editor</Text>
        )}
      </Box>
    </Box>
  )
}
