import React from 'react'
import { Box, useInput, Color, Text } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import useTasks from './use-tasks'

const Select = ({ selected, children }) => {
  if (selected) {
    return <Color green>{children}</Color>
  } else {
    return children
  }
}

const Task = ({ task, onChange, selected = false }) => {
  const [editing, setEditing] = React.useState(false)
  useInput((input) => {
    if (selected) {
      if (input === 'c') {
        setEditing(true)
      } else if (input === 'm') {
        onChange({ ...task, status: !task.status })
      }
    }
  })
  const handleNameChange = (newName) => {
    onChange({ ...task, name: newName })
    setEditing(false)
  }
  return (
    <Select selected={selected}>
      <Box textWrap='truncate'>
        [{task.status ? 'X' : ' '}]{' '}
        {editing ? (
          <UncontrolledTextInput
            placeholder={task.name}
            onSubmit={handleNameChange}
          />
        ) : (
          task.name
        )}
      </Box>
    </Select>
  )
}

export default Task
