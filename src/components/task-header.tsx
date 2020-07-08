import { Box, Text } from 'ink'
import { dropLast } from 'ramda'
import React from 'react'
import { AnyTask, useTasks } from '../hooks/tasks'
import {
  folderPathString,
  formatDate,
  isFolder,
  isTask,
  taskPath,
} from '../utils'
import FullwidthBox from './fullwidth-box'

export default function TaskHeader({ task }: { task: AnyTask }) {
  const { root } = useTasks()
  return (
    <Box flexDirection='column'>
      <FullwidthBox>
        <Text>
          {'    '}
          {isTask(task) ? 'Task' : isFolder(task) ? 'Folder' : 'Note'}:{' '}
          {task.name}
        </Text>
      </FullwidthBox>
      {!(isFolder(task) && task.id === root.id) && (
        <FullwidthBox>
          <Text>
            Path:{' /'}
            {folderPathString(root, dropLast(2, taskPath(root, task.id)))}
          </Text>
        </FullwidthBox>
      )}
      <FullwidthBox>
        <Text>Creation date: {formatDate(task.creationDate)}</Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>Modification date: {formatDate(task.modificationDate)}</Text>
      </FullwidthBox>
    </Box>
  )
}
