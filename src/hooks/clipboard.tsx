import { Box, Color } from 'ink'
import {
  compose,
  dissocPath,
  insert,
  lensPath,
  lensProp,
  over,
  view,
} from 'ramda'
import type { Lens } from 'ramda'
import React from 'react'
import { allTasksCount, completedTasksCount, taskPath } from '../utils'
import FOCUS from '../constants/focus'
import { useFocus } from './focus'
import { useTasks } from './tasks'
import type { RootFolderReturnType } from './tasks'
import type { TaskType, FolderType } from './tasks'

interface ClipboardContextType {
  clipboard: FolderType | TaskType | null
  setClipboard: React.Dispatch<
    React.SetStateAction<FolderType | TaskType | null>
  >
}
const ClipboardContext = React.createContext<ClipboardContextType>({
  clipboard: null,
  setClipboard: () => {},
})

export const ClipboardProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [clipboard, setClipboard] = React.useState<
    FolderType | TaskType | null
  >(null)
  return (
    <ClipboardContext.Provider value={{ clipboard, setClipboard }}>
      {children}
    </ClipboardContext.Provider>
  )
}

export const useClipboard = () => {
  const { clipboard, setClipboard } = React.useContext(ClipboardContext)
  const { folder, setFolder } = useTasks(undefined) as RootFolderReturnType
  const { refocus } = useFocus()

  const ClipboardStatus = () => (
    <Box>
      {clipboard !== null && (
        <Color>
          Clipboard content:{' '}
          {'tasks' in clipboard
            ? `folder "${clipboard.name}" (${completedTasksCount(
                clipboard.tasks
              )}/${allTasksCount(clipboard.tasks)})`
            : `task "${clipboard?.name}"`}
        </Color>
      )}
    </Box>
  )

  return {
    ClipboardStatus,
    cut: (id: TaskType['id']) =>
      setClipboard((clipboard: FolderType | TaskType | null):
        | FolderType
        | TaskType
        | null => {
        if (clipboard !== null) return clipboard
        const taskP = taskPath(folder, id)
        if (taskP === null) return null
        const task = view(lensPath(taskP), folder) as TaskType
        setFolder(dissocPath(taskP, folder))
        return task
      }),
    paste: (folderId: FolderType['id'], after: number) => {
      setClipboard((clipboard) => {
        if (clipboard === null) return null
        const folderP = taskPath(folder, folderId)
        if (folderP === null) {
          return null
        }
        setFolder(
          over(
            compose(lensPath(folderP), lensProp('tasks')) as Lens,
            insert(after, clipboard),
            folder
          )
        )
        refocus(FOCUS.task(clipboard.id))
        return null
      })
    },
  }
}
