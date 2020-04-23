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
  const focusedFolder = focus.filter((f) => f.tag === FOCUS.folder().tag)
  const { folder } = useTasks(
    focusedFolder.length !== 0 ? last(focusedFolder).id : undefined
  )

  React.useEffect(() => {
    pushFocus(FOCUS.folder(folder.id, folder.name))
  }, [])

  const { exit } = useApp()
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit()
    }
  })

  if (focus.length !== 0) {
    return <FolderView folder={folder} />
  } else {
    return <Box>Loading...</Box>
  }
}

if (!process.argv.some((v) => v === '--no-fullscreen')) {
  const enterAltScreenCommand = '\x1b[?1049h'
  const leaveAltScreenCommand = '\x1b[?1049l'
  process.stdout.write(enterAltScreenCommand)
  process.on('exit', () => {
    process.stdout.write(leaveAltScreenCommand)
  })
}

render(
  <TasksProvider path={process.env.TASKS || 'tasks.json'}>
    <FocusProvider initialFocus={[]}>
      <TodoInk />
    </FocusProvider>
  </TasksProvider>,
  { experimental: true, exitOnCtrlC: false }
)
