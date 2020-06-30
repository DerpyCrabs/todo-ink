import { Text } from 'ink'
import { lensPath, view } from 'ramda'
import React from 'react'
import { TaskId, useTasks } from '../hooks/tasks'
import type { FolderType } from '../hooks/tasks'
import {
  allTasksCount,
  completedTasksCount,
  folderPathString,
  taskPath,
} from '../utils'
import FullwidthBox from './fullwidth-box'

export default function FolderHeader({ folderId }: { folderId: TaskId }) {
  const { root } = useTasks()
  const folderPath = taskPath(root, folderId)
  const folder = view(lensPath(folderPath), root) as FolderType

  const path = folderPathString(root, folderPath)

  return (
    <FullwidthBox>
      <Text>
        {'    '}Folder: /{path}{' '}
        {allTasksCount(folder.tasks) !== 0 && (
          <>
            ({completedTasksCount(folder.tasks)}/{allTasksCount(folder.tasks)})
          </>
        )}{' '}
        (modified {folder.modificationDate}) (created {folder.creationDate})
      </Text>
    </FullwidthBox>
  )
}
