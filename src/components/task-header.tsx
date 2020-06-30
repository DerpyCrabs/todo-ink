import { Box, Text } from 'ink'
import { dropLast } from 'ramda'
import React from 'react'
import { TaskType, useTasks } from '../hooks/tasks'
import { folderPathString, taskPath } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function TaskHeader({ task }: { task: TaskType }) {
  const { root } = useTasks()
  return (
    <Box flexDirection='column'>
      <FullwidthBox>
        <Text>Task: {task.name}</Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>
          Folder:{' /'}
          {folderPathString(root, dropLast(2, taskPath(root, task.id)))}
        </Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>Creation date: {task.creationDate}</Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>Modification date: {task.modificationDate}</Text>
      </FullwidthBox>
    </Box>
  )
}
