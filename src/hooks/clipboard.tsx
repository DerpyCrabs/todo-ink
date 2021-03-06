import { Text } from 'ink'
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
import {
  allTasksCount,
  completedTasksCount,
  isFolder,
  isNote,
  isTask,
  taskPath,
} from '../utils'
import { useFocus } from './focus'
import { AnyTask, TaskId, useTasks } from './tasks'

interface ClipboardContextType {
  clipboard: Array<AnyTask>
  setClipboard: React.Dispatch<React.SetStateAction<Array<AnyTask>>>
}
const ClipboardContext = React.createContext<ClipboardContextType>({
  clipboard: [],
  setClipboard: () => {},
})

// eslint-disable-next-line react/display-name
export const ClipboardProvider = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const [clipboard, setClipboard] = React.useState<Array<AnyTask>>([])
    return (
      <ClipboardContext.Provider value={{ clipboard, setClipboard }}>
        {children}
      </ClipboardContext.Provider>
    )
  }
)

// eslint-disable-next-line react/display-name
const ClipboardStatus = React.memo(
  ({ clipboard }: { clipboard: Array<AnyTask> }) => (
    <FullwidthBox>
      {clipboard.length !== 0 && (
        <Text>
          Clipboard content:{' '}
          {isFolder(clipboard[0])
            ? `folder "${clipboard[0].name}" (${completedTasksCount(
                clipboard[0].tasks
              )}/${allTasksCount(clipboard[0].tasks)})`
            : isTask(clipboard[0])
            ? `task "${clipboard[0].name}"`
            : isNote(clipboard[0])
            ? `note "${clipboard[0].name}"`
            : 'unknown variant of task'}{' '}
          {clipboard.length > 1 && `and ${clipboard.length - 1} more tasks`}
        </Text>
      )}
    </FullwidthBox>
  )
)

export const useClipboard = () => {
  const { clipboard, setClipboard } = React.useContext(ClipboardContext)
  const { root, setRoot } = useTasks()
  const { refocus } = useFocus()

  const cut = React.useCallback(
    (id: TaskId) =>
      setClipboard(
        (clipboard: Array<AnyTask>): Array<AnyTask> => {
          const taskP = taskPath(root, id)
          const task = view(lensPath(taskP), root) as AnyTask
          setRoot(dissocPath(taskP, root))
          return prepend(task, clipboard)
        }
      ),
    [root, setClipboard, setRoot]
  )
  const paste = React.useCallback(
    (folderId: TaskId, after: number) => {
      setClipboard((clipboard) => {
        if (clipboard.length === 0) return []
        const folderP = taskPath(root, folderId)
        setRoot(
          over(
            compose(lensPath(folderP), lensProp('tasks')) as Lens,
            insert(after, clipboard[0]),
            root
          )
        )
        refocus(FOCUS.selectedTask(clipboard[0].id))
        return tail(clipboard)
      })
    },
    [refocus, root, setClipboard, setRoot]
  )

  const clipboardStatus = React.useCallback(
    () => <ClipboardStatus clipboard={clipboard} />,
    [clipboard]
  )
  return {
    ClipboardStatus: clipboardStatus,
    cut,
    paste,
  }
}
