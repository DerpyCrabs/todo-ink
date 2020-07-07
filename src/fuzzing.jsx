import { render } from 'ink-testing-library'
import { defaultTo } from 'ramda'
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
  const hotkeys =
    defaultTo('all', process.argv[2]) === 'all'
      ? [
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
          'D',
          'r',
          '\u001b[A', // up
          '\u001b[B', // down
          '\u001b[D', // left
          '\u001b[C', // right
          '\r', // return
          '\u001b', // escape
          '\u0008', // backspace
          '\u007f', // delete
        ]
      : process.argv[2] === 'moving'
      ? [
          't',
          'f',
          'e',
          'j',
          'k',
          '\u001b[A', // up
          '\u001b[B', // down
          '\r', // return
          '\u001b', // escape
        ]
      : process.argv[2] === 'deleting'
      ? [
          't',
          'f',
          'd',
          'r',
          'D',
          '\u001b[A', // up
          '\u001b[B', // down
          '\r', // return
          '\u001b', // escape
        ]
      : null

  if (hotkeys === null)
    throw new Error('Available fuzzing options are "moving" and "all"')

  const input = hotkeys[Math.floor(Math.random() * hotkeys.length)]
  stdin.write(input)
  console.log(input)
  setTimeout(fuzzy, process.argv[3] || 35)
}
fuzzy()
