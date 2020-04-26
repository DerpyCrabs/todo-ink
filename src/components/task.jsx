import React from 'react'
import { Box } from 'ink'
import { UncontrolledTextInput } from './text-input'
import Select from './select'
import { useFocus } from '../hooks/focus'
import FOCUS from '../constants/focus'
import { isMark, isChange } from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'

const Task = ({ task, onChange }) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  // prettier-ignore
  useHotkeys([
    [isChange, () => {
        pushFocus(FOCUS.editingTask(task.id))
      },],
    [isMark, () => {
        onChange({ ...task, status: !task.status })
      },],
    ], isFocused(FOCUS.task(task.id)))

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
