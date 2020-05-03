import React from 'react'
import type { TaskType } from '../hooks/tasks'
import TaskHeader from '../components/task-header'
import TaskDescription from '../components/task-description'
import { useTask } from '../hooks/tasks'
import { Box } from 'ink'
import useHotkeys from '../hooks/hotkeys'
import { isLeave } from '../constants/hotkeys'
import { useRouter } from '../hooks/router'

export default function TaskView({ id }: { id: TaskType['id'] }) {
  const { task } = useTask(id)
  const { back } = useRouter()

  // prettier-ignore
  useHotkeys([
    [isLeave, () => {
      back()
      },],
    ], true)

  return (
    <Box flexDirection='column'>
      <TaskHeader task={task} />
      <TaskDescription description='# kek' />
      {/* {task.description !== undefined ? (
        <TaskDescription description={task.description} />
      ) : (
        <Box>No description. Press 'e' to open description editor</Box>
      )} */}
    </Box>
  )
}
