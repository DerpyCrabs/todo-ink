import React from 'react'
import { render, Box, useInput, useApp, useStdin } from 'ink'
import useTasks from './use-tasks'
import Task from './task'
import Select from './select'
import { UncontrolledTextInput } from './text-input'

const TodoInk = () => {
  const [tasks, setTasks] = useTasks('tasks.json')
  const { exit } = useApp()
  const [selected, setSelected] = React.useState(tasks.length ? 0 : null)
  const [adding, setAdding] = React.useState(false)
  const taskChangeHandler = (task, i) => {
    let tasksCopy = tasks.slice()
    tasksCopy[i] = task
    setTasks(tasksCopy)
  }
  const newTaskHandler = (v, i) => {
    if (v.trim()) {
      let tasksCopy = tasks.slice()
      tasksCopy.splice(i, 0, { name: v, status: false })
      setTasks(tasksCopy)
      setSelected(i)
    }
    setAdding(false)
  }
  useInput((input, key) => {
    if (key.escape) {
      exit()
    }
    if (key.downArrow && selected < tasks.length - 1) {
      setSelected(selected + 1)
    } else if (key.upArrow && selected > 0) {
      setSelected(selected - 1)
    } else if (input === 'd') {
      if (selected === null) return
      let tasksCopy = tasks.slice()
      tasksCopy.splice(selected, 1)
      setTasks(tasksCopy)
      if (tasksCopy.length === 0) {
        setSelected(null)
      } else if (selected !== 0) {
        setSelected(selected - 1)
      }
    } else if (input === 'n') {
      setAdding(true)
    }
  })

  return (
    <Box flexDirection='column'>
      {tasks.map((task, i) => (
        <React.Fragment key={i}>
          <Task
            task={task}
            onChange={(t) => taskChangeHandler(t, i)}
            selected={selected === i && !adding}
          />
          {adding && selected === i && (
            <Select selected={true}>
              <UncontrolledTextInput
                prompt='> '
                onSubmit={(v) => newTaskHandler(v, i + 1)}
              />
            </Select>
          )}
        </React.Fragment>
      ))}
      {selected === null && (
        <Select selected={true}>
          <UncontrolledTextInput
            prompt='> '
            onSubmit={(v) => newTaskHandler(v, 0)}
          />
        </Select>
      )}
    </Box>
  )
}

// const enterAltScreenCommand = '\x1b[?1049h'
// const leaveAltScreenCommand = '\x1b[?1049l'
// process.stdout.write(enterAltScreenCommand)
// process.on('exit', () => {
//   process.stdout.write(leaveAltScreenCommand)
// })

render(<TodoInk />, { experimental: true })
