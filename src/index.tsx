import { EventEmitter } from 'events'
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

// Show full ramda functions' stack traces
Error.stackTraceLimit = 1000
// Don't show warning on many event listeners because of useStdoutSize hook on every task
// 500 should be enough for any terminal
EventEmitter.defaultMaxListeners = 500

render(
  <TasksProvider path={process.env.TASKS || 'tasks.json'}>
    <Index />
  </TasksProvider>,
  { experimental: true, exitOnCtrlC: true }
)
