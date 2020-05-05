import React from 'react'
import { useTasks, TaskId } from '../hooks/tasks'
import { taskPath } from '../utils'
import type { FolderType, RootFolderReturnType, TaskType } from '../hooks/tasks'
import { lensPath, view, compose, lensProp } from 'ramda'
import type { Lens } from 'ramda'
import { completedTasksCount, allTasksCount, folderPathString } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function FolderHeader({ folderId }: { folderId: TaskId }) {
  const { folder } = useTasks(undefined) as RootFolderReturnType
  const folderPath = taskPath(folder, folderId)
  if (folderPath === null) return null
  const tasks = view(
    compose(lensPath(folderPath), lensProp('tasks')) as Lens,
    folder
  ) as Array<FolderType | TaskType>

  const path = folderPathString(folder, folderPath)

  return (
    <FullwidthBox>
      {'    '}Folder: /{path} ({completedTasksCount(tasks)}/
      {allTasksCount(tasks)})
    </FullwidthBox>
  )
}
