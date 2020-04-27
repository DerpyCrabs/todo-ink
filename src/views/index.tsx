import { useApp } from 'ink'
import React from 'react'
import { isExit } from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'
import { Router } from '../hooks/router'
import { useTasks } from '../hooks/tasks'
import FolderView from './folder'

const Index = () => {
  const { folder } = useTasks(undefined)

  const { exit } = useApp()
  useHotkeys([[isExit, exit]])

  return (
    <Router initialPath={`/folder/${folder.id}`}>
      <FolderView path='/folder/:folderId' />
    </Router>
  )
}

export default Index
