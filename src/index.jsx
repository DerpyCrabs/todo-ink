import React from 'react'
import { render, Box, useInput, useApp, useStdin } from 'ink'
import useTasks from './use-tasks'
import Task from './task'
import Select from './select'
import { UncontrolledTextInput } from './text-input'
import { FocusProvider, useFocus } from './use-focus'
import { remove, lensIndex, set, insert } from 'ramda'
import FOCUS from './focus'

const TodoInk = () => {
  const { tasks, setTasks, newTask } = useTasks(
    process.env.TASKS || 'tasks.json'
  )
  const { exit } = useApp()
  const [_, { isFocused, pushFocus, popFocus }] = useFocus(FOCUS.root)
  const [selected, setSelected] = React.useState(tasks.length ? 0 : null)

  React.useEffect(() => {
    if (selected === null) {
      pushFocus(FOCUS.addingTask)
    }
  }, [selected])

  const taskChangeHandler = (task, i) => {
    setTasks(set(lensIndex(i), task, tasks))
  }
  const newTaskHandler = (v, i) => {
    if (v.trim()) {
      setTasks(insert(i, newTask(v, false), tasks))
      setSelected(i)
    }
    popFocus()
  }
  const newTaskCancelHandler = () => {
    popFocus()
  }
  useInput((input, key) => {
    if (isFocused(FOCUS.root)) {
      if (key.escape) {
        exit()
      } else if (key.downArrow && selected < tasks.length - 1) {
        setSelected(selected + 1)
      } else if (key.upArrow && selected > 0) {
        setSelected(selected - 1)
      } else if (input === 'j' && selected < tasks.length - 1) {
        let tc = tasks.slice()
        ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
        setTasks(tc)
        setSelected(selected + 1)
      } else if (input === 'k' && selected > 0) {
        let tc = tasks.slice()
        ;[tc[selected], tc[selected - 1]] = [tc[selected - 1], tc[selected]]
        setTasks(tc)
        setSelected(selected - 1)
      } else if (input === 'd') {
        setTasks(remove(selected, 1, tasks))
        setSelected(tasks.length === 1 ? null : Math.max(0, selected - 1))
      } else if (input === 'n') {
        pushFocus(FOCUS.addingTask)
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
            selected={selected === i && !isFocused(FOCUS.addingTask)}
          />
          {isFocused(FOCUS.addingTask) && selected === i && (
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
  <FocusProvider initialFocus={FOCUS.root}>
    <TodoInk />
  </FocusProvider>,
  { experimental: true }
)
