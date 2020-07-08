import { Box, Text } from 'ink'
import { dropLast } from 'ramda'
import React from 'react'
import { NoteType, TaskType, useTasks } from '../hooks/tasks'
import { folderPathString, formatDate, isTask, taskPath } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function TaskHeader({ task }: { task: TaskType | NoteType }) {
  const { root } = useTasks()
  return (
    <Box flexDirection='column'>
      <FullwidthBox>
        <Text>
          {'    '}
          {isTask(task) ? 'Task' : 'Note'}: {task.name}
        </Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>
          Folder:{' /'}
          {folderPathString(root, dropLast(2, taskPath(root, task.id)))}
        </Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>Creation date: {formatDate(task.creationDate)}</Text>
      </FullwidthBox>
      <FullwidthBox>
        <Text>Modification date: {formatDate(task.modificationDate)}</Text>
      </FullwidthBox>
    </Box>
  )
}
