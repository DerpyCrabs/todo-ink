import { insert, lensIndex, set } from 'ramda'
import React from 'react'
import FOCUS, { FocusType } from '../constants/focus'
import type { AddingFocus } from '../constants/focus'
import {
  popFocus as popFocusPure,
  refocus as refocusPure,
  useFocus,
} from '../hooks/focus'
import { NoteType, TaskId, useFolder } from '../hooks/tasks'
import type { FolderType, TaskType } from '../hooks/tasks'
import { isFolder, isNote, isTask } from '../utils'
import Folder from './folder'
import Note from './note'
import ScrollableList from './scrollable-list'
import Select from './select'
import Task from './task'
import TextInput from './text-input'

const FolderViewTaskList = ({
  id,
  selected,
}: {
  id: TaskId
  selected: number | null
}) => {
  const { tasks, newTask, newFolder, newNote, setTasks } = useFolder(id)

  const { isFocused, popFocus, focus, setFocus } = useFocus()

  const taskChangeHandler = (
    task: TaskType | FolderType | NoteType,
    i: number
  ) => {
    setTasks(set(lensIndex(i), task, tasks))
  }

  const newTaskHandlerFactory = (
    newTaskFn: (name: string) => TaskType | FolderType | NoteType,
    focusTag: FocusType
  ) => (v: string, i: number) => {
    let taskId: TaskId | null = null
    if (v.trim()) {
      const task = newTaskFn(v)
      setTasks(insert(i, task, tasks))

      taskId = task.id
    }
    setFocus((focus) => {
      const newFocus = popFocusPure(focus, focusTag.tag)
      if (v.trim()) {
        return refocusPure(newFocus, FOCUS.selectedTask(taskId))
      } else {
        return newFocus
      }
    })
  }
  const newTaskHandler = newTaskHandlerFactory(newTask, FOCUS.addingTask())
  const newNoteHandler = newTaskHandlerFactory(newNote, FOCUS.addingNote())
  const newFolderHandler = newTaskHandlerFactory(
    newFolder,
    FOCUS.addingFolder()
  )

  const newTaskCancelHandler = () => {
    popFocus(FOCUS.addingTask().tag)
  }
  const newFolderCancelHandler = () => {
    popFocus(FOCUS.addingFolder().tag)
  }
  const newNoteCancelHandler = () => {
    popFocus(FOCUS.addingNote().tag)
  }

  return (
    <ScrollableList
      position={(() => {
        if (
          isFocused(FOCUS.addingTask().tag) ||
          isFocused(FOCUS.addingNote().tag) ||
          isFocused(FOCUS.addingFolder().tag)
        ) {
          const addingPosition = (focus[focus.length - 1] as AddingFocus)
            .position
          if (addingPosition !== undefined) {
            return addingPosition
          } else {
            return 0
          }
        } else if (tasks.length === 0) {
          return 0
        } else {
          return selected
        }
      })()}
      margin={3}
    >
      {(() => {
        const children: Array<React.ReactElement> = []
        let taskIndex = 0
        for (let i = 0; i < tasks.length + 1; i++) {
          if (isFocused(FOCUS.addingTask(i))) {
            children.push(
              <Select key={`${i}-addingTask`} selected={true}>
                <TextInput
                  prompt='> '
                  onSubmit={(v: string) => newTaskHandler(v, i)}
                  onCancel={newTaskCancelHandler}
                />
              </Select>
            )
          } else if (isFocused(FOCUS.addingNote(i))) {
            children.push(
              <Select key={`${i}-addingNote`} selected={true}>
                <TextInput
                  prompt='> '
                  onSubmit={(v: string) => newNoteHandler(v, i)}
                  onCancel={newNoteCancelHandler}
                />
              </Select>
            )
          } else if (isFocused(FOCUS.addingFolder(i))) {
            children.push(
              <Select key={`${i}-addingFolder`} selected={true}>
                <TextInput
                  prompt='[F] > '
                  onSubmit={(v: string) => newFolderHandler(v, i)}
                  onCancel={newFolderCancelHandler}
                />
              </Select>
            )
          } else if (taskIndex < tasks.length) {
            const task = tasks[taskIndex]
            const Component = isFolder(task)
              ? Folder
              : isTask(task)
              ? Task
              : isNote(task)
              ? Note
              : undefined
            if (Component === undefined) {
              throw new Error('Unexpected task variant')
            }
            children.push(
              <Component
                key={task.id}
                task={task as any}
                onChange={(t: TaskType | FolderType | NoteType) =>
                  taskChangeHandler(t, i)
                }
              />
            )
            taskIndex += 1
          }
        }
        return children
      })()}
    </ScrollableList>
  )
}

export default FolderViewTaskList
