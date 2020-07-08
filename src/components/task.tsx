import React from 'react'
import FOCUS from '../constants/focus'
import { isChange, isEnter, isMark } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys, { Hotkey } from '../hooks/hotkeys'
import { useRouter } from '../hooks/router'
import type { NoteType, TaskType } from '../hooks/tasks'
import { isTask } from '../utils'
import FullwidthBox from './fullwidth-box'
import Select from './select'
import TaskBadge from './task-badge'
import TextInput from './text-input'

const Task = ({
  task,
  indentation = 0,
  onChange = () => {},
}: {
  task: TaskType | NoteType
  indentation?: number
  onChange?: (t: TaskType | NoteType) => void
}) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  const { go } = useRouter()
  // prettier-ignore
  useHotkeys([
    [isChange, () => {
        pushFocus(FOCUS.editingTask(task.id))
      },],
    [isEnter, () => {
        go(`/task/${task.id}`)
      },],
    ...(isTask(task) ?
    [[isMark, () => {
        onChange({ ...task, status: !task.status })
      }] as [Hotkey, () => void]] : [])
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
        <TaskBadge task={task} />{' '}
        {isFocused(FOCUS.editingTask(task.id)) ? (
          <TextInput
            value={task.name}
            onSubmit={handleNameChange}
            onCancel={handleNameChangeCancel}
          />
        ) : (
          task.name
        )}
      </Select>
    </FullwidthBox>
  )
}

export default Task
