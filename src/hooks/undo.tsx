import React from 'react'
import useHotkeys from '../hooks/hotkeys'
import { isUndo } from '../constants/hotkeys'
import { useTasks, FolderType } from '../hooks/tasks'
import type { RootFolderReturnType } from '../hooks/tasks'
import { defaultTo } from 'ramda'

export default function useUndo(active?: boolean) {
  const [prev, setPrev] = React.useState(null as FolderType | null)
  const { folder, setFolder } = useTasks() as RootFolderReturnType

  React.useEffect(() => {
    return () => {
      setPrev(folder)
    }
  }, [folder])

  // prettier-ignore
  useHotkeys([
    [isUndo, () => {
      if (prev !== null) {
        setFolder(prev)
      }
      },],
    ], defaultTo(true, active))
}
