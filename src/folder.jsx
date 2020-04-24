import React from 'react'
import { Box, Color, Text } from 'ink'
import { UncontrolledTextInput } from './text-input'
import useTasks from './use-tasks'
import useInput from './use-input'
import Select from './select'
import { useFocus } from './use-focus'
import FOCUS from './focus'
import { sum } from 'ramda'
import { isChange, isEnter } from './hotkeys'
import useHotkeys from './use-hotkeys'

const Folder = ({ task, onChange }) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  useHotkeys(
    [
      [
        isChange,
        () => {
          pushFocus(FOCUS.editingTask(task.id))
        },
      ],
      [
        isEnter,
        () => {
          pushFocus(FOCUS.folder(task.id, task.name))
        },
      ],
    ],
    isFocused(FOCUS.task(task.id))
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
