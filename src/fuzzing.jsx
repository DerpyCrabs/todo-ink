import { render } from 'ink-testing-library'
import React from 'react'
import { TasksProvider } from './hooks/tasks'
import Index from './views/index'

const { stdin, stderr, lastFrame } = render(
  <TasksProvider path={'test-assets/fuzzing-tasks.json'}>
    <Index />
  </TasksProvider>
)
const fuzzy = () => {
  const output = lastFrame()
  if (stderr.lastFrame() && stderr.lastFrame().trim() !== '') {
    throw new Error(output)
  }
  if (
    output.search('React') !== -1 ||
    output.search('Rejection') !== -1 ||
    output.search('Error') !== -1
  ) {
    throw new Error(output)
  }
  // eslint-disable-next-line no-control-regex
  console.log(output.replace(/\u001b\[.*?m/g, ''))
  // TODO get hotkeys from hotkeys
  const hotkeys = [
    't',
    'f',
    'd',
    'n',
    'e',
    'j',
    'k',
    'T',
    'F',
    'N',
    'x',
    'p',
    'P',
    'c',
    'm',
    's',
    'u',
    '\u001b[A', // up
    '\u001b[B', // down
    '\u001b[D', // left
    '\u001b[C', // right
    '\r', // return
    '\u001b', // escape
    '\u0008', // backspace
    '\u007f', // delete
  ]
  const input = hotkeys[Math.floor(Math.random() * hotkeys.length)]
  stdin.write(input)
  console.log(input)
  setTimeout(fuzzy, process.argv[2] || 35)
}
fuzzy()
