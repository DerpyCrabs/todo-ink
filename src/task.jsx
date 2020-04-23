import React from 'react'
import { Box, Color, Text } from 'ink'
import { UncontrolledTextInput } from './text-input'
import useTasks from './use-tasks'
import useInput from './use-input'
import Select from './select'
import { useFocus } from './use-focus'
import FOCUS from './focus'
import { isMark, isChange } from './hotkeys'

const Task = ({ task, onChange }) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  useInput(
    (input, key) => {
      if (isFocused(FOCUS.task(task.id))) {
        if (isChange(key, input)) {
          pushFocus(FOCUS.editingTask(task.id))
        } else if (isMark(key, input)) {
          onChange({ ...task, status: !task.status })
        }
      }
    },
    { active: isFocused(FOCUS.task(task.id)) }
  )
  const handleNameChange = (newName) => {
    onChange({ ...task, name: newName })
    popFocus(FOCUS.editingTask().tag)
  }
  const handleNameChangeCancel = () => {
    popFocus(FOCUS.editingTask().tag)
  }
  return (
    <Select
      selected={
        isFocused(FOCUS.task(task.id)) || isFocused(FOCUS.editingTask(task.id))
      }
    >
      <Box textWrap='truncate'>
        [{task.status ? 'X' : ' '}]{' '}
        {isFocused(FOCUS.editingTask(task.id)) ? (
          <UncontrolledTextInput
            value={task.name}
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
