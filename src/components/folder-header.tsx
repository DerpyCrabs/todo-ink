import React from 'react'
import { taskPath, useTasks } from '../hooks/tasks'
import type { FolderType, RootTaskReturnType, TaskType } from '../hooks/tasks'
import { Box } from 'ink'
import { lensPath, view, compose, lensProp, scan, splitEvery } from 'ramda'
import type { Lens } from 'ramda'
import { completedTasksCount, allTasksCount } from '../components/folder'

export default function FolderHeader({
  folderId,
}: {
  folderId: FolderType['id']
}) {
  const { folder } = useTasks(undefined) as RootTaskReturnType
  const folderPath = taskPath(folder, folderId)
  if (folderPath === null) return null
  const tasks = view(
    compose(lensPath(folderPath), lensProp('tasks')) as Lens,
    folder
  ) as Array<FolderType | TaskType>

  const path = (() => {
    const folderPaths = scan(
      (acc, elem: Array<string | number>) => [...acc, ...elem],
      [],
      splitEvery(2, folderPath)
    )
    const folderNames = folderPaths
      .slice(1)
      .map((path) => (view(lensPath(path), folder) as FolderType).name)
    return folderNames.join('/')
  })()

  return (
    <Box>
      {'    '}Folder: /{path} ({completedTasksCount(tasks)}/
      {allTasksCount(tasks)})
    </Box>
  )
}
