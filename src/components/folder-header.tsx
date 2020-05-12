import { compose, lensPath, lensProp, view } from 'ramda'
import type { Lens } from 'ramda'
import React from 'react'
import { NoteType, TaskId, useTasks } from '../hooks/tasks'
import type { FolderType, TaskType } from '../hooks/tasks'
import { taskPath } from '../utils'
import { allTasksCount, completedTasksCount, folderPathString } from '../utils'
import FullwidthBox from './fullwidth-box'

export default function FolderHeader({ folderId }: { folderId: TaskId }) {
  const { root } = useTasks()
  const folderPath = taskPath(root, folderId)
  const tasks = view(
    compose(lensPath(folderPath), lensProp('tasks')) as Lens,
    root
  ) as Array<FolderType | TaskType | NoteType>

  const path = folderPathString(root, folderPath)

  return (
    <FullwidthBox>
      {'    '}Folder: /{path}{' '}
      {allTasksCount(tasks) !== 0 && (
        <>
          ({completedTasksCount(tasks)}/{allTasksCount(tasks)})
        </>
      )}
    </FullwidthBox>
  )
}
