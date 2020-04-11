import React from 'react'
import { Box, Color, Text } from 'ink'
import { UncontrolledTextInput } from './text-input'
import useTasks from './use-tasks'
import useInput from './use-input'
import Select from './select'
import { useFocus } from './use-focus'
import FOCUS from './focus'

const Task = ({ task, onChange, selected = false }) => {
  const [_, { pushFocus, popFocus, isFocused }] = useFocus()
  useInput(
    (input, key) => {
      if (selected && isFocused(FOCUS.root)) {
        if (input === 'c') {
          pushFocus(FOCUS.editingTask(task.id))
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
        {isFocused(FOCUS.editingTask(task.id)) ? (
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
