import React from 'react'
import type { TaskType } from '../hooks/tasks'
import { Box } from 'ink'

export default function TaskHeader({ task }: { task: TaskType }) {
  return <Box>Task: {task.name}</Box>
}
