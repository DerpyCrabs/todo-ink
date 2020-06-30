import { defaultTo } from 'ramda'
import React from 'react'
import { isUndo } from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'
import { FolderType, useTasks } from '../hooks/tasks'

export default function useUndo(active?: boolean) {
  const [prev, setPrev] = React.useState(null as FolderType | null)
  const { root, setRoot } = useTasks()

  React.useEffect(() => {
    return () => {
      setPrev(root)
    }
  }, [root])

  // prettier-ignore
  useHotkeys([
    [isUndo, () => {
      if (prev !== null) {
        setRoot(prev)
      }
      },],
    ], defaultTo(true, active))

  const resetUndo = React.useCallback(() => setPrev(null), [])
  return resetUndo
}
