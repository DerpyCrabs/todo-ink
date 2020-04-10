import React from 'react'
import { render, Box, useInput, useApp } from 'ink'
import useTasks from './use-tasks'
import Task from './task'

const TodoInk = () => {
  const [tasks, setTasks] = useTasks('tasks.json')
  const { exit } = useApp()
  const [selected, setSelected] = React.useState(0)
  const taskChangeHandler = (task, i) => {
    let tasksCopy = tasks.slice()
    tasksCopy[i] = task
    setTasks(tasksCopy)
  }
  useInput((input, key) => {
    if (key.escape) {
      exit()
    } else if (key.downArrow && selected < tasks.length - 1) {
      setSelected(selected + 1)
    } else if (key.upArrow && selected > 0) {
      setSelected(selected - 1)
    }
  })

  return (
    <Box flexDirection='column'>
      {tasks.map((task, i) => (
        <Task
          task={task}
          onChange={(t) => taskChangeHandler(t, i)}
          selected={selected === i}
          key={i}
        />
      ))}
    </Box>
  )
}

render(<TodoInk />)
