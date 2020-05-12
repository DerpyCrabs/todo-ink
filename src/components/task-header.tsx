import { Box } from 'ink'
import { dropLast } from 'ramda'
import React from 'react'
import { TaskType, useTasks } from '../hooks/tasks'
import { folderPathString, taskPath } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function TaskHeader({ task }: { task: TaskType }) {
  const { root } = useTasks()
  return (
    <Box flexDirection='column'>
      <FullwidthBox>Task: {task.name}</FullwidthBox>
      <FullwidthBox>
        Folder:{' /'}
        {folderPathString(root, dropLast(2, taskPath(root, task.id)))}
      </FullwidthBox>
    </Box>
  )
}
