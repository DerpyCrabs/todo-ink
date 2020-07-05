import React from 'react'
import FOCUS from '../constants/focus'
import { ClipboardProvider } from '../hooks/clipboard'
import { FocusProvider } from '../hooks/focus'
import { Router } from '../hooks/router'
import { useTasks } from '../hooks/tasks'
import FolderView from './folder'
import NoteView from './note'
import SearchView from './search'
import TaskView from './task'

const Index = () => {
  const { root } = useTasks()

  return (
    <FocusProvider initialFocus={[FOCUS.folder(root.id)]}>
      <ClipboardProvider>
        <Router>
          <FolderView path='/folder/:id/:selected' />
          <SearchView path='/search/:id' />
          <TaskView path='/task/:id' />
          <NoteView path='/note/:id' />
        </Router>
      </ClipboardProvider>
    </FocusProvider>
  )
}

export default Index
