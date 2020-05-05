import React from 'react'
import FOCUS from '../constants/focus'
import { isChange, isEnter } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { useRouter } from '../hooks/router'
import type { FolderType } from '../hooks/tasks'
import { allTasksCount, completedTasksCount } from '../utils'
import FullwidthBox from './fullwidth-box'
import Select from './select'
import TextInput from './text-input'

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
      <FullwidthBox>
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
      </FullwidthBox>
    </Select>
  )
}

export default Folder
