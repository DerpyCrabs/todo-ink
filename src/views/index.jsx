import React from 'react'
import { Box, useApp } from 'ink'
import { useTasks } from '../hooks/tasks'
import { useFocus } from '../hooks/focus'
import { remove, lensIndex, set, insert, last } from 'ramda'
import FOCUS from '../constants/focus'
import FolderView from '../views/folder'
import { isExit } from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'

const Index = () => {
  const { isFocused, pushFocus, popFocus, focus, refocus } = useFocus()
  const focusedFolder = focus.filter((f) => f.tag === FOCUS.folder().tag)
  const { folder } = useTasks(
    focusedFolder.length !== 0 ? last(focusedFolder).id : undefined
  )

  React.useEffect(() => {
    pushFocus(FOCUS.folder(folder.id, folder.name))
  }, [])

  const { exit } = useApp()
  useHotkeys([[isExit, exit]])

  if (focus.length !== 0) {
    return <FolderView folder={folder} />
  } else {
    return <Box>Loading...</Box>
  }
}

export default Index
