import { Box } from 'ink'
import React from 'react'
import FOCUS from '../constants/focus'
import { isChange, isEnter } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import Select from './select'
import TextInput from './text-input'
import type { FolderType } from '../hooks/tasks'
import { useRouter } from '../hooks/router'
import { completedTasksCount, allTasksCount } from '../utils'

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
    ], isFocused(FOCUS.selectedTask(task.id)))

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
        isFocused(FOCUS.selectedTask(task.id)) ||
        isFocused(FOCUS.editingTask(task.id))
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
