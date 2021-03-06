import React from 'react'
import FOCUS from '../constants/focus'
import { ClipboardProvider } from '../hooks/clipboard'
import { ErrorDialogProvider } from '../hooks/error-dialog'
import { FocusProvider } from '../hooks/focus'
import { Router } from '../hooks/router'
import { useTasks } from '../hooks/tasks'
import DeletedView from './deleted'
import FolderView from './folder'
import SearchView from './search'
import TaskView from './task'

const Index = () => {
  const { root } = useTasks()

  return (
    <FocusProvider initialFocus={[FOCUS.folder(root.id)]}>
      <ClipboardProvider>
        <ErrorDialogProvider>
          <Router>
            <FolderView path='/folder/:id/:selected' />
            <SearchView path='/search/:id' />
            <TaskView path='/task/:id' />
            <DeletedView path='/deleted/:id' />
          </Router>
        </ErrorDialogProvider>
      </ClipboardProvider>
    </FocusProvider>
  )
}

export default Index
