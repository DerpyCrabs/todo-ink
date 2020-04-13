import React from 'react'
import { Box, Color, Text } from 'ink'
import { UncontrolledTextInput } from './text-input'
import useTasks from './use-tasks'
import useInput from './use-input'
import Select from './select'
import { useFocus } from './use-focus'
import FOCUS from './focus'
import { sum } from 'ramda'

const Folder = ({ task, onChange }) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  useInput(
    (input, key) => {
      if (isFocused(FOCUS.task(task.id))) {
        if (input === 'c') {
          pushFocus(FOCUS.editingTask(task.id))
        } else if (key.rightArrow) {
          pushFocus(FOCUS.folder(task.id))
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
        [F]{' '}
        {isFocused(FOCUS.editingTask(task.id)) ? (
          <UncontrolledTextInput
            placeholder={task.name}
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

function completedTasksCount(tasks) {
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

function allTasksCount(tasks) {
  return sum(
    tasks.map((task) =>
      task.tasks === undefined ? 1 : allTasksCount(task.tasks)
    )
  )
}
