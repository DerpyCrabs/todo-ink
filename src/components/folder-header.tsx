import { compose, lensPath, lensProp, view } from 'ramda'
import type { Lens } from 'ramda'
import React from 'react'
import { TaskId, useTasks } from '../hooks/tasks'
import type { FolderType, RootFolderReturnType, TaskType } from '../hooks/tasks'
import { taskPath } from '../utils'
import { allTasksCount, completedTasksCount, folderPathString } from '../utils'
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
