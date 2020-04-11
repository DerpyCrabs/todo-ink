import React from 'react'
import { Box, Color, Text } from 'ink'
import { UncontrolledTextInput } from './text-input'
import useTasks from './use-tasks'
import useInput from './use-input'
import Select from './select'
import { useFocus } from './use-focus'

const Task = ({ task, onChange, selected = false }) => {
  const [isFocused, { pushFocus, popFocus }] = useFocus('root')
  const [isEditing] = useFocus(`editing-${task.id}`)
  useInput(
    (input, key) => {
      if (selected && isFocused) {
        if (input === 'c') {
          pushFocus(`editing-${task.id}`)
        } else if (input === 'm') {
          onChange({ ...task, status: !task.status })
        }
      }
    },
    { active: selected }
  )
  const handleNameChange = (newName) => {
    onChange({ ...task, name: newName })
    popFocus()
  }
  const handleNameChangeCancel = () => {
    popFocus()
  }
  return (
    <Select selected={selected}>
      <Box textWrap='truncate'>
        [{task.status ? 'X' : ' '}]{' '}
        {isEditing ? (
          <UncontrolledTextInput
            placeholder={task.name}
            onSubmit={handleNameChange}
            onCancel={handleNameChangeCancel}
          />
        ) : (
          task.name
        )}
      </Box>
    </Select>
  )
}

export default Task
