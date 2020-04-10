import React from 'react'
import { render, Box, useInput, useApp, Color, Text } from 'ink'
import useTasks from './use-tasks'

const Task = ({ task }) => (
  <Box textWrap='truncate'>
    [{task.status ? 'X' : ' '}] {task.name}
  </Box>
)

const TodoInk = () => {
  const [tasks, setTasks] = useTasks('tasks.json')
  const { exit } = useApp()
  const [selected, setSelected] = React.useState(0)
  useInput((input, key) => {
    if (key.escape) {
      exit()
    } else if (key.downArrow && selected < tasks.length - 1) {
      setSelected(selected + 1)
    } else if (key.upArrow && selected > 0) {
      setSelected(selected - 1)
    } else if (input === 'm') {
      let tasksCopy = tasks.slice()
      tasksCopy[selected].status = !tasks[selected].status
      setTasks(tasksCopy)
    }
  })

  return (
    <Box flexDirection='column'>
      {tasks.map((task, i) =>
        i === selected ? (
          <Color green key={i}>
            <Task task={task} />
          </Color>
        ) : (
          <Task task={task} key={i} />
        )
      )}
    </Box>
  )
}

render(<TodoInk />)
