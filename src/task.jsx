import React from 'react'
import { Box, Color, Text } from 'ink'
import { UncontrolledTextInput } from './text-input'
import useTasks from './use-tasks'
import useInput from './use-input'
import Select from './select'

const Task = ({ task, onChange, selected = false }) => {
  const [editing, setEditing] = React.useState(false)
  useInput(
    (input, key) => {
      if (selected && !editing) {
        if (input === 'c') {
          setEditing(true)
        } else if (input === 'm') {
          onChange({ ...task, status: !task.status })
        }
      }
    },
    { active: selected }
  )
  const handleNameChange = (newName) => {
    onChange({ ...task, name: newName })
    setEditing(false)
  }
  return (
    <Select selected={selected}>
      <Box textWrap='truncate'>
        [{task.status ? 'X' : ' '}]{' '}
        {editing ? (
          <UncontrolledTextInput onSubmit={handleNameChange} />
        ) : (
          task.name
        )}
      </Box>
    </Select>
  )
}

export default Task
