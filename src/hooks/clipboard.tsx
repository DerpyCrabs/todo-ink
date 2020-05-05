import { Color } from 'ink'
import {
  compose,
  dissocPath,
  insert,
  lensPath,
  lensProp,
  over,
  prepend,
  tail,
  view,
} from 'ramda'
import type { Lens } from 'ramda'
import React from 'react'
import FullwidthBox from '../components/fullwidth-box'
import FOCUS from '../constants/focus'
import { allTasksCount, completedTasksCount, taskPath } from '../utils'
import { useFocus } from './focus'
import { TaskId, useTasks } from './tasks'
import type { RootFolderReturnType } from './tasks'
import type { FolderType, TaskType } from './tasks'

interface ClipboardContextType {
  clipboard: Array<FolderType | TaskType>
  setClipboard: React.Dispatch<
    React.SetStateAction<Array<FolderType | TaskType>>
  >
}
const ClipboardContext = React.createContext<ClipboardContextType>({
  clipboard: [],
  setClipboard: () => {},
})

export const ClipboardProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [clipboard, setClipboard] = React.useState<
    Array<FolderType | TaskType>
  >([])
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
    <FullwidthBox>
      {clipboard.length !== 0 && (
        <Color>
          Clipboard content:{' '}
          {'tasks' in clipboard[0]
            ? `folder "${clipboard[0].name}" (${completedTasksCount(
                clipboard[0].tasks
              )}/${allTasksCount(clipboard[0].tasks)})`
            : `task "${clipboard[0]?.name}"`}{' '}
          {clipboard.length > 1 && `and ${clipboard.length - 1} more tasks`}
        </Color>
      )}
    </FullwidthBox>
  )

  return {
    ClipboardStatus,
    cut: (id: TaskId) =>
      setClipboard(
        (
          clipboard: Array<FolderType | TaskType>
        ): Array<FolderType | TaskType> => {
          const taskP = taskPath(folder, id)
          if (taskP === null) return clipboard
          const task = view(lensPath(taskP), folder) as TaskType
          setFolder(dissocPath(taskP, folder))
          return prepend(task, clipboard)
        }
      ),
    paste: (folderId: TaskId, after: number) => {
      setClipboard((clipboard) => {
        if (clipboard.length === 0) return []
        const folderP = taskPath(folder, folderId)
        if (folderP === null) {
          return clipboard
        }
        setFolder(
          over(
            compose(lensPath(folderP), lensProp('tasks')) as Lens,
            insert(after, clipboard[0]),
            folder
          )
        )
        refocus(FOCUS.selectedTask(clipboard[0].id))
        return tail(clipboard)
      })
    },
  }
}
