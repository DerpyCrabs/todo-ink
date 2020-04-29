import { render } from 'ink'
import React from 'react'
import { TasksProvider } from './hooks/tasks'
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
    <Index />
  </TasksProvider>,
  { experimental: true, exitOnCtrlC: false }
)
