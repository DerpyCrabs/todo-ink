import React from 'react'
import { useTasks } from '../hooks/tasks'
import { taskPath } from '../utils'
import type { FolderType, RootFolderReturnType, TaskType } from '../hooks/tasks'
import { Box } from 'ink'
import { lensPath, view, compose, lensProp } from 'ramda'
import type { Lens } from 'ramda'
import { completedTasksCount, allTasksCount, folderPathString } from '../utils'

export default function FolderHeader({
  folderId,
}: {
  folderId: FolderType['id']
}) {
  const { folder } = useTasks(undefined) as RootFolderReturnType
  const folderPath = taskPath(folder, folderId)
  if (folderPath === null) return null
  const tasks = view(
    compose(lensPath(folderPath), lensProp('tasks')) as Lens,
    folder
  ) as Array<FolderType | TaskType>

  const path = folderPathString(folder, folderPath)

  return (
    <Box>
      {'    '}Folder: /{path} ({completedTasksCount(tasks)}/
      {allTasksCount(tasks)})
    </Box>
  )
}
