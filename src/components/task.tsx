import React from 'react'
import FOCUS from '../constants/focus'
import { isChange, isEnter, isMark } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { useRouter } from '../hooks/router'
import type { TaskType } from '../hooks/tasks'
import FullwidthBox from './fullwidth-box'
import Select from './select'
import TextInput from './text-input'

const Task = ({
  task,
  indentation = 0,
  onChange = () => {},
}: {
  task: TaskType
  indentation?: number
  onChange?: (t: TaskType) => void
}) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  const { go } = useRouter()
  // prettier-ignore
  useHotkeys([
    [isChange, () => {
        pushFocus(FOCUS.editingTask(task.id))
      },],
    [isMark, () => {
        onChange({ ...task, status: !task.status })
      },],
    [isEnter, () => {
        go(`/task/${task.id}`)
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
      <FullwidthBox indentation={indentation}>
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
      </FullwidthBox>
    </Select>
  )
}

export default Task
