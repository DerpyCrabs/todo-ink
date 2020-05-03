import { Box } from 'ink'
import { dropLast } from 'ramda'
import React from 'react'
import { RootFolderReturnType, TaskType, useTasks } from '../hooks/tasks'
import { folderPathString, taskPath } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function TaskHeader({ task }: { task: TaskType }) {
  const { folder: root } = useTasks() as RootFolderReturnType
  return (
    <Box flexDirection='column'>
      <FullwidthBox>Task: {task.name}</FullwidthBox>
      <FullwidthBox>
        Folder:{' /'}
        {folderPathString(
          root,
          dropLast(2, taskPath(root, task.id) as Array<string | number>)
        )}
      </FullwidthBox>
    </Box>
  )
}
