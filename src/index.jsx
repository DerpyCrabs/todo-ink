import React from 'react'
import { render } from 'ink'
import { TasksProvider } from './hooks/tasks'
import { FocusProvider } from './hooks/focus'
import { ClipboardProvider } from './hooks/clipboard'
import Index from './views/index'

if (!process.argv.some((v) => v === '--no-fullscreen')) {
  const enterAltScreenCommand = '\x1b[?1049h'
  const leaveAltScreenCommand = '\x1b[?1049l'
  process.stdout.write(enterAltScreenCommand)
  process.on('exit', () => {
    process.stdout.write(leaveAltScreenCommand)
  })
}

Error.stackTraceLimit = 1000

render(
  <TasksProvider path={process.env.TASKS || 'tasks.json'}>
    <FocusProvider initialFocus={[]}>
      <ClipboardProvider>
        <Index />
      </ClipboardProvider>
    </FocusProvider>
  </TasksProvider>,
  { experimental: true, exitOnCtrlC: false }
)
