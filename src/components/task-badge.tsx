import { Text } from 'ink'
import React from 'react'
import { AnyTask } from '../hooks/tasks'
import { isFolder, isTask } from '../utils'

export default function TaskBadge({ task }: { task: AnyTask }) {
  if (isTask(task)) {
    if (task.status) {
      return <Text>[X]</Text>
    } else {
      return <Text>[ ]</Text>
    }
  } else if (isFolder(task)) {
    return <Text>[F]</Text>
  } else {
    return <Text>[N]</Text>
  }
}
