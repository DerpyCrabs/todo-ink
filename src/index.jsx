import React from 'react'
import { render, Box, useInput, useApp, useStdin } from 'ink'
import { TasksProvider, useTasks } from './use-tasks'
import Task from './task'
import Select from './select'
import { UncontrolledTextInput } from './text-input'
import { FocusProvider, useFocus } from './use-focus'
import { remove, lensIndex, set, insert, last } from 'ramda'
import FOCUS from './focus'
import FolderView from './folder-view'

const TodoInk = () => {
  const { isFocused, pushFocus, popFocus, focus, refocus } = useFocus()
  const focusedFolder = focus.filter((f) => f.tag === 'folder')
  const { folder } = useTasks(
    focusedFolder.length !== 0 ? last(focusedFolder).id : undefined
  )

  return <FolderView folder={folder} />
}

// const enterAltScreenCommand = '\x1b[?1049h'
// const leaveAltScreenCommand = '\x1b[?1049l'
// process.stdout.write(enterAltScreenCommand)
// process.on('exit', () => {
//   process.stdout.write(leaveAltScreenCommand)
// })
const InitialFocus = () => {
  const { folder } = useTasks(undefined)
  return (
    <FocusProvider initialFocus={[FOCUS.folder(folder.id)]}>
      <TodoInk />
    </FocusProvider>
  )
}

render(
  <TasksProvider path={process.env.TASKS || 'tasks.json'}>
    <InitialFocus />
  </TasksProvider>,
  { experimental: true }
)
