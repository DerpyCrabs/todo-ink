import React from 'react'
import { Box } from 'ink'
import { UncontrolledTextInput } from './text-input'
import Select from './select'
import { useFocus } from '../hooks/focus'
import FOCUS from '../constants/focus'
import { sum } from 'ramda'
import { isChange, isEnter } from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'

const Folder = ({ task, onChange }) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  // prettier-ignore
  useHotkeys([
    [isChange, () => {
        pushFocus(FOCUS.editingTask(task.id))
      },],
    [isEnter, () => {
        pushFocus(FOCUS.folder(task.id, task.name))
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
        [F]{' '}
        {isFocused(FOCUS.editingTask(task.id)) ? (
          <UncontrolledTextInput
            value={task.name}
            onSubmit={handleNameChange}
            onCancel={handleNameChangeCancel}
          />
        ) : (
          task.name
        )}{' '}
        ({completedTasksCount(task.tasks)}/{allTasksCount(task.tasks)})
      </Box>
    </Select>
  )
}

export default Folder

export function completedTasksCount(tasks) {
  return sum(
    tasks.map((task) =>
      task.tasks === undefined
        ? task.status
          ? 1
          : 0
        : completedTasksCount(task.tasks)
    )
  )
}

export function allTasksCount(tasks) {
  return sum(
    tasks.map((task) =>
      task.tasks === undefined ? 1 : allTasksCount(task.tasks)
    )
  )
}
