import { useApp } from 'ink'
import React from 'react'
import FOCUS from '../constants/focus'
import { isExit } from '../constants/hotkeys'
import { ClipboardProvider } from '../hooks/clipboard'
import { FocusProvider } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { Router } from '../hooks/router'
import { useTasks } from '../hooks/tasks'
import FolderView from './folder'

const Index = () => {
  const { folder } = useTasks(undefined)

  const { exit } = useApp()
  useHotkeys([[isExit, exit]])

  return (
    <FocusProvider initialFocus={[FOCUS.folder(folder.id)]}>
      <ClipboardProvider>
        <Router>
          <FolderView path='/folder/:id' />
        </Router>
      </ClipboardProvider>
    </FocusProvider>
  )
}

export default Index
