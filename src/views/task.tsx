import React from 'react'
import type { TaskType } from '../hooks/tasks'
import TaskHeader from '../components/task-header'
import TaskDescription from '../components/task-description'
import { useTask } from '../hooks/tasks'
import { Box } from 'ink'
import useHotkeys from '../hooks/hotkeys'
import { isLeave, isEdit } from '../constants/hotkeys'
import { useRouter } from '../hooks/router'
import { edit } from 'external-editor'

export default function TaskView({ id }: { id: TaskType['id'] }) {
  const { task, setTask } = useTask(id)
  const { back } = useRouter()

  // prettier-ignore
  useHotkeys([
    [isLeave, () => {
      back()
      },],
    [isEdit, () => {
      try {
        setTask({...task, description: edit(task.description, { postfix: '.md' })})
      } catch (e) {}
      },],
    ], true)

  return (
    <Box flexDirection='column'>
      <TaskHeader task={task} />
      {task.description !== undefined ? (
        <TaskDescription description={task.description} margin={3} />
      ) : (
        <Box>No description. Press 'e' to open description editor</Box>
      )}
    </Box>
  )
}
