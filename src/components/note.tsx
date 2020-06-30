import React from 'react'
import FOCUS from '../constants/focus'
import { isChange, isEnter } from '../constants/hotkeys'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { useRouter } from '../hooks/router'
import type { NoteType } from '../hooks/tasks'
import FullwidthBox from './fullwidth-box'
import Select from './select'
import TextInput from './text-input'

const Note = ({
  task,
  indentation = 0,
  onChange = () => {},
}: {
  task: NoteType
  indentation?: number
  onChange?: (t: NoteType) => void
}) => {
  const { pushFocus, popFocus, isFocused } = useFocus()
  const { go } = useRouter()
  // prettier-ignore
  useHotkeys([
    [isChange, () => {
        pushFocus(FOCUS.editingTask(task.id))
      },],
    [isEnter, () => {
        go(`/note/${task.id}`)
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
        [N]{' '}
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

export default Note
