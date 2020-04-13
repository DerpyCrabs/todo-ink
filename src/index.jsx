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
  const { isFocused, pushFocus, popFocus, focus, refocus } = useFocus()
  const selected = (() => {
    const last = focus[focus.length - 1]
    if (last.tag === 'task' || last.tag === 'editing') {
      return tasks.findIndex((t) => t.id === last.id)
    } else {
      return null
    }
  })()

  React.useEffect(() => {
    if (tasks.length !== 0) {
      pushFocus(FOCUS.task(tasks[0].id))
    } else {
      pushFocus(FOCUS.addingTask(null))
    }
  }, [])

  const taskChangeHandler = (task, i) => {
    setTasks(set(lensIndex(i), task, tasks))
  }

  const newTaskHandler = (v, i) => {
    popFocus(FOCUS.addingTask().tag)
    if (v.trim()) {
      const task = newTask(v, false)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.task(task.id))
    }
  }

  const newTaskCancelHandler = () => {
    popFocus(FOCUS.addingTask().tag)
  }

  useInput((input, key) => {
    if (isFocused(FOCUS.root)) {
      if (key.escape) {
        exit()
      } else if (key.downArrow) {
        if (selected !== null && selected !== tasks.length - 1) {
          refocus(FOCUS.task(tasks[selected + 1].id))
        }
      } else if (key.upArrow) {
        if (selected !== null && selected !== 0) {
          refocus(FOCUS.task(tasks[selected - 1].id))
        }
      } else if (input === 'j' && selected < tasks.length - 1) {
        if (selected < tasks.length - 1) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
          setTasks(tc)
        }
      } else if (input === 'k') {
        if (selected < 0) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected - 1]] = [tc[selected - 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.task(tc[selected - 1].id))
        }
      } else if (input === 'd') {
        setTasks(remove(selected, 1, tasks))
        if (tasks.length === 1) {
          popFocus(FOCUS.task().tag)
          pushFocus(FOCUS.addingTask(null))
        } else {
          const newSelected =
            tasks.length - 1 === selected ? Math.max(0, selected - 1) : selected
          refocus(FOCUS.task(remove(selected, 1, tasks)[newSelected].id))
        }
      } else if (input === 'n') {
        pushFocus(FOCUS.addingTask(selected))
      }
    }
  })

  return (
    <Box flexDirection='column'>
      {tasks.map((task, i) => (
        <React.Fragment key={i}>
          <Task task={task} onChange={(t) => taskChangeHandler(t, i)} />
          {isFocused(FOCUS.addingTask(i)) && (
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
      {isFocused(FOCUS.addingTask(null)) && (
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
  <FocusProvider initialFocus={[FOCUS.root]}>
    <TodoInk />
  </FocusProvider>,
  { experimental: true }
)
