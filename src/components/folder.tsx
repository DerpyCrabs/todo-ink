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
  indentation = 0,
  onChange = () => {},
  expanded = false,
}: {
  task: FolderType
  indentation?: number
  onChange?: (t: FolderType) => void
  expanded: boolean
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
    <FullwidthBox indentation={indentation}>
      <Select
        selected={
          isFocused(FOCUS.selectedTask(task.id)) ||
          isFocused(FOCUS.editingTask(task.id))
        }
      >
        {expanded ? '\\F/' : '[F]'}{' '}
        {isFocused(FOCUS.editingTask(task.id)) ? (
          <TextInput
            value={task.name}
            onSubmit={handleNameChange}
            onCancel={handleNameChangeCancel}
          />
        ) : (
          task.name
        )}{' '}
        {allTasksCount(task.tasks) !== 0 && (
          <>
            ({completedTasksCount(task.tasks)}/{allTasksCount(task.tasks)})
          </>
        )}
      </Select>
    </FullwidthBox>
  )
}

export default Folder
