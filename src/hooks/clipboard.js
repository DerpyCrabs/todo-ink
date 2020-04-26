import React from 'react'
import { useTasks, taskPath } from './tasks'
import { Color, Box } from 'ink'
import {
  lensPath,
  view,
  dissocPath,
  over,
  compose,
  lensProp,
  insert,
} from 'ramda'
import { useFocus } from './focus'
import FOCUS from '../constants/focus'
import { completedTasksCount, allTasksCount } from '../components/folder'

const ClipboardContext = React.createContext()
export const ClipboardProvider = ({ children }) => {
  const [clipboard, setClipboard] = React.useState(null)
  return (
    <ClipboardContext.Provider value={{ clipboard, setClipboard }}>
      {children}
    </ClipboardContext.Provider>
  )
}

export const useClipboard = () => {
  const { clipboard, setClipboard } = React.useContext(ClipboardContext)
  const { folder, setFolder } = useTasks(undefined)
  const { refocus } = useFocus()

  const ClipboardStatus = () => (
    <Box>
      {clipboard !== null && (
        <Color>
          Clipboard content:{' '}
          {clipboard.tasks !== undefined
            ? `folder "${clipboard.name}" (${completedTasksCount(
                clipboard.tasks
              )}/${allTasksCount(clipboard.tasks)})`
            : `task "${clipboard.name}"`}
        </Color>
      )}
    </Box>
  )

  return {
    ClipboardStatus,
    cut: (id) =>
      setClipboard((clipboard) => {
        if (clipboard !== null) return clipboard
        const taskP = taskPath(folder, id)
        const task = view(lensPath(taskP), folder)
        setFolder(dissocPath(taskP, folder))
        return task
      }),
    paste: (folderId, after) => {
      setClipboard((clipboard) => {
        if (clipboard === null) return null
        const folderP = taskPath(folder, folderId)
        setFolder(
          over(
            compose(lensPath(folderP), lensProp('tasks')),
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
