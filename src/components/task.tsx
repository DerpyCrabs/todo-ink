import { Box } from 'ink'
import React from 'react'
import FOCUS from '../constants/focus'
import { isChange, isMark } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import Select from './select'
import TextInput from './text-input'
import type { TaskType } from '../hooks/tasks'

const Task = ({
  task,
  onChange = () => {},
}: {
  task: TaskType
  onChange?: (t: TaskType) => void
}) => {
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

  const handleNameChange = (newName: string) => {
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
          <TextInput
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
