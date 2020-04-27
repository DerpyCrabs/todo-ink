import { Box } from 'ink'
import { sum } from 'ramda'
import React from 'react'
import FOCUS from '../constants/focus'
import { isChange, isEnter } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import Select from './select'
import TextInput from './text-input'
import type { TaskType, FolderType } from '../hooks/tasks'
import { useRouter } from '../hooks/router'

const Folder = ({
  task,
  onChange = () => {},
}: {
  task: FolderType
  onChange?: (t: FolderType) => void
}) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  const { go } = useRouter()
  // prettier-ignore
  useHotkeys([
    [isChange, () => {
        pushFocus(FOCUS.editingTask(task.id))
      },],
    [isEnter, () => {
      go(`/folder/${task.id}`)
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
        [F]{' '}
        {isFocused(FOCUS.editingTask(task.id)) ? (
          <TextInput
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

export function completedTasksCount(
  tasks: Array<FolderType | TaskType>
): number {
  return sum(
    tasks.map((task) =>
      'tasks' in task ? completedTasksCount(task.tasks) : task.status ? 1 : 0
    )
  )
}

export function allTasksCount(tasks: Array<FolderType | TaskType>): number {
  return sum(
    tasks.map((task) => ('tasks' in task ? allTasksCount(task.tasks) : 1))
  )
}
