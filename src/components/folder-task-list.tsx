import { insert, lensIndex, set } from 'ramda'
import React from 'react'
import FOCUS from '../constants/focus'
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

  const newTaskHandler = (v: string, i: number) => {
    let taskId: TaskId | null = null
    if (v.trim()) {
      const task = newTask(v, false)
      setTasks(insert(i, task, tasks))
      taskId = task.id
    }
    setFocus((focus) => {
      const newFocus = popFocusPure(focus, FOCUS.addingTask().tag)
      if (v.trim()) {
        return refocusPure(newFocus, FOCUS.selectedTask(taskId))
      } else {
        return newFocus
      }
    })
  }
  const newNoteHandler = (v: string, i: number) => {
    let taskId: TaskId | null = null
    if (v.trim()) {
      const task = newNote(v)
      setTasks(insert(i, task, tasks))
      taskId = task.id
    }
    setFocus((focus) => {
      const newFocus = popFocusPure(focus, FOCUS.addingNote().tag)
      if (v.trim()) {
        return refocusPure(newFocus, FOCUS.selectedTask(taskId))
      } else {
        return newFocus
      }
    })
  }
  const newFolderHandler = (v: string, i: number) => {
    let taskId: TaskId | null = null
    if (v.trim()) {
      const task = newFolder(v)
      setTasks(insert(i, task, tasks))
      taskId = task.id
    }
    setFocus((focus) => {
      const newFocus = popFocusPure(focus, FOCUS.addingFolder().tag)
      if (v.trim()) {
        return refocusPure(newFocus, FOCUS.selectedTask(taskId))
      } else {
        return newFocus
      }
    })
  }

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
            if (isFolder(task)) {
              children.push(
                <Folder
                  key={task.id}
                  task={task}
                  onChange={(t) => taskChangeHandler(t, i)}
                />
              )
            } else if (isTask(task)) {
              children.push(
                <Task
                  key={task.id}
                  task={task}
                  onChange={(t) => taskChangeHandler(t, i)}
                />
              )
            } else if (isNote(task)) {
              children.push(
                <Note
                  key={task.id}
                  task={task}
                  onChange={(t) => taskChangeHandler(t, i)}
                />
              )
            } else {
              throw new Error('Unexpected task variant in folder')
            }
            taskIndex += 1
          }
        }
        return children
      })()}
    </ScrollableList>
  )
}

export default FolderViewTaskList
