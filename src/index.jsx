import React from 'react'
import { render, Box, useInput, useApp, useStdin } from 'ink'
import useTasks from './use-tasks'
import Task from './task'
import Select from './select'
import { UncontrolledTextInput } from './text-input'
import { FocusProvider, useFocus } from './use-focus'

const TodoInk = () => {
  const [tasks, setTasks] = useTasks('tasks.json')
  const { exit } = useApp()
  const [isFocused, { pushFocus, popFocus }] = useFocus('root')
  const [selected, setSelected] = React.useState(tasks.length ? 0 : null)
  const [adding] = useFocus('adding')

  React.useEffect(() => {
    if (selected === null) {
      pushFocus('adding')
    }
  }, [selected])

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
    popFocus()
  }
  const newTaskCancelHandler = () => {
    popFocus()
  }
  useInput((input, key) => {
    if (isFocused) {
      if (key.escape) {
        exit()
      } else if (key.downArrow && selected < tasks.length - 1) {
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
        pushFocus('adding')
      }
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
                onCancel={newTaskCancelHandler}
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

render(
  <FocusProvider initialFocus='root'>
    <TodoInk />
  </FocusProvider>,
  { experimental: true }
)
