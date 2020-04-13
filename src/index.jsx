import React from 'react'
import { render, Box, useInput, useApp, useStdin } from 'ink'
import { TasksProvider, useTasks } from './use-tasks'
import Task from './task'
import Select from './select'
import { UncontrolledTextInput } from './text-input'
import { FocusProvider, useFocus } from './use-focus'
import { remove, lensIndex, set, insert } from 'ramda'
import FOCUS from './focus'
import FolderView from './folder-view'

const TodoInk = () => {
  const { root } = useTasks()
  const { exit } = useApp()
  const { isFocused, pushFocus, popFocus, focus, refocus } = useFocus()

  useInput((input, key) => {
    if (isFocused(FOCUS.root)) {
      if (key.escape) {
        exit()
      }
    }
  })

  return <FolderView folder={root} />
}

// const enterAltScreenCommand = '\x1b[?1049h'
// const leaveAltScreenCommand = '\x1b[?1049l'
// process.stdout.write(enterAltScreenCommand)
// process.on('exit', () => {
//   process.stdout.write(leaveAltScreenCommand)
// })

render(
  <TasksProvider path={process.env.TASKS || 'tasks.json'}>
    <FocusProvider initialFocus={[FOCUS.root]}>
      <TodoInk />
    </FocusProvider>
  </TasksProvider>,
  { experimental: true }
)
