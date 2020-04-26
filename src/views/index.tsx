import { Box, useApp } from 'ink'
import { last } from 'ramda'
import React from 'react'
import FOCUS from '../constants/focus'
import { isExit } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { useTasks } from '../hooks/tasks'
import FolderView from './folder'
import type { FocusType } from '../constants/focus'

const Index = () => {
  const { pushFocus, focus } = useFocus()
  const focusedFolder = focus.filter((f) => f.tag === FOCUS.folder().tag)
  const { folder } = useTasks(
    focusedFolder.length !== 0
      ? ((last(focusedFolder) as FocusType).id as number)
      : undefined
  )

  React.useEffect(() => {
    pushFocus(FOCUS.folder(folder.id, folder.name))
    // focus root folder on initial rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
