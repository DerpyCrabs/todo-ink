import React from 'react'
import { Box, Color, Text } from 'ink'
import { UncontrolledTextInput } from './text-input'
import useTasks from './use-tasks'
import useInput from './use-input'
import Select from './select'
import { useFocus } from './use-focus'

const Task = ({ task, onChange, selected = false }) => {
  const [editing, setEditing] = React.useState(false)
  const [isFocused, { pushFocus, popFocus }] = useFocus('root')
  useInput(
    (input, key) => {
      if (selected && !editing && isFocused) {
        if (input === 'c') {
          setEditing(true)
          pushFocus('editing')
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
    popFocus()
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
