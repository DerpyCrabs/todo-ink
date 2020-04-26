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
import { allTasksCount, completedTasksCount } from '../components/folder'
import FOCUS from '../constants/focus'
import { useFocus } from './focus'
import { taskPath, useTasks } from './tasks'
import type { RootTaskReturnType } from './tasks'
import type { Task, Folder } from './tasks'

interface ClipboardContextType {
  clipboard: Folder | Task | null
  setClipboard: React.Dispatch<React.SetStateAction<Folder | Task | null>>
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
  const [clipboard, setClipboard] = React.useState<Folder | Task | null>(null)
  return (
    <ClipboardContext.Provider value={{ clipboard, setClipboard }}>
      {children}
    </ClipboardContext.Provider>
  )
}

export const useClipboard = () => {
  const { clipboard, setClipboard } = React.useContext(ClipboardContext)
  const { folder, setFolder } = useTasks(undefined) as RootTaskReturnType
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
    cut: (id: Task['id']) =>
      setClipboard((clipboard: Folder | Task | null): Folder | Task | null => {
        if (clipboard !== null) return clipboard
        const taskP = taskPath(folder, id)
        if (taskP === null) return null
        const task = view(lensPath(taskP), folder) as Task
        setFolder(dissocPath(taskP, folder))
        return task
      }),
    paste: (folderId: Folder['id'], after: number) => {
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
