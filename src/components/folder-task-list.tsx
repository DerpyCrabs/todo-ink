import { Lens, compose, insert, lensIndex, lensProp, over, set } from 'ramda'
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
import { TaskTreeItem } from '../views/folder'
import Folder from './folder'
import FullwidthBox from './fullwidth-box'
import Note from './note'
import ScrollableList from './scrollable-list'
import Select from './select'
import Task from './task'
import TextInput from './text-input'

const FolderViewTaskList = ({
  id,
  tasks,
  selected,
}: {
  id: TaskId
  tasks: Array<TaskTreeItem>
  selected: number | null
}) => {
  const { newTask, newFolder, newNote, setFolder, folder } = useFolder(id)

  const { isFocused, popFocus, focus, setFocus } = useFocus()

  const taskChangeHandler = (
    task: TaskType | FolderType | NoteType,
    i: number
  ) => setFolder(set(tasks[i].lens, task, folder))

  const newTaskHandlerFactory = (
    newTaskFn: (name: string) => TaskType | FolderType | NoteType
  ) => (v: string, i: number) => {
    let taskId: TaskId | null = null
    if (v.trim()) {
      const task = newTaskFn(v)
      if (tasks.length !== 0) {
        if (isFolder(tasks[i].task) && tasks[i].expanded) {
          setFolder(
            over(
              compose(tasks[i].lens, lensProp('tasks')) as Lens,
              insert(0, task),
              folder
            )
          )
        } else {
          setFolder(
            over(
              compose(tasks[i].parentLens, lensProp('tasks')) as Lens,
              insert(tasks[i].parentIndex + 1, task),
              folder
            )
          )
        }
      } else {
        setFolder(over(lensProp('tasks'), insert(0, task), folder))
      }
      taskId = task.id
    }
    setFocus((focus) => {
      const newFocus = popFocusPure(focus)
      if (v.trim()) {
        return refocusPure(newFocus, FOCUS.selectedTask(taskId))
      } else {
        return newFocus
      }
    })
  }
  const newTaskBeforeHandlerFactory = (
    newTaskFn: (name: string) => TaskType | FolderType | NoteType
  ) => (v: string, i: number) => {
    let taskId: TaskId | null = null
    if (v.trim()) {
      const task = newTaskFn(v)
      if (tasks.length !== 0) {
        setFolder(
          over(
            compose(tasks[i].parentLens, lensProp('tasks')) as Lens,
            insert(tasks[i].parentIndex, task),
            folder
          )
        )
      } else {
        setFolder(over(lensProp('tasks'), insert(0, task), folder))
      }
      taskId = task.id
    }
    setFocus((focus) => {
      const newFocus = popFocusPure(focus)
      if (v.trim()) {
        return refocusPure(newFocus, FOCUS.selectedTask(taskId))
      } else {
        return newFocus
      }
    })
  }
  const newTaskHandler = newTaskHandlerFactory(newTask)
  const newNoteHandler = newTaskHandlerFactory(newNote)
  const newFolderHandler = newTaskHandlerFactory(newFolder)
  const newTaskBeforeHandler = newTaskBeforeHandlerFactory(newTask)
  const newNoteBeforeHandler = newTaskBeforeHandlerFactory(newNote)
  const newFolderBeforeHandler = newTaskBeforeHandlerFactory(newFolder)

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
            return addingPosition + 1
          } else {
            return 0
          }
        } else if (
          isFocused(FOCUS.addingTaskBefore().tag) ||
          isFocused(FOCUS.addingNoteBefore().tag) ||
          isFocused(FOCUS.addingFolderBefore().tag)
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
        if (tasks.length === 0) {
          if (isFocused(FOCUS.addingTask().tag)) {
            return (
              <Select key={`addingTask`} selected={true}>
                <TextInput
                  prompt='> '
                  onSubmit={(v: string) => newTaskHandler(v, 0)}
                  onCancel={popFocus}
                />
              </Select>
            )
          } else if (isFocused(FOCUS.addingNote().tag)) {
            return (
              <Select key={`addingNote`} selected={true}>
                <TextInput
                  prompt='> '
                  onSubmit={(v: string) => newNoteHandler(v, 0)}
                  onCancel={popFocus}
                />
              </Select>
            )
          } else if (isFocused(FOCUS.addingFolder().tag)) {
            return (
              <Select key={`addingFolder`} selected={true}>
                <TextInput
                  prompt='[F] > '
                  onSubmit={(v: string) => newFolderHandler(v, 0)}
                  onCancel={popFocus}
                />
              </Select>
            )
          }
        } else {
          return tasks.map((task, i) => {
            const beforeIndent = task.indentation
            const afterIndent = task.expanded
              ? task.indentation + 1
              : task.indentation
            return (
              <React.Fragment key={task.task.id}>
                {isFocused(FOCUS.addingTaskBefore(i)) && (
                  <FullwidthBox indentation={beforeIndent}>
                    <Select key={`${i}-addingTaskBefore`} selected={true}>
                      <TextInput
                        prompt='> '
                        onSubmit={(v: string) => newTaskBeforeHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )}
                {isFocused(FOCUS.addingNoteBefore(i)) && (
                  <FullwidthBox indentation={beforeIndent}>
                    <Select key={`${i}-addingNoteBefore`} selected={true}>
                      <TextInput
                        prompt='[N] > '
                        onSubmit={(v: string) => newNoteBeforeHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )}
                {isFocused(FOCUS.addingFolderBefore(i)) && (
                  <FullwidthBox indentation={beforeIndent}>
                    <Select key={`${i}-addingFolderBefore`} selected={true}>
                      <TextInput
                        prompt='[F] > '
                        onSubmit={(v: string) => newFolderBeforeHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )}
                {isFolder(task.task) && (
                  <Folder
                    key={task.task.id}
                    indentation={task.indentation}
                    task={task.task}
                    onChange={(t) => taskChangeHandler(t, i)}
                    expanded={task.expanded}
                  />
                )}
                {isTask(task.task) && (
                  <Task
                    key={task.task.id}
                    indentation={task.indentation}
                    task={task.task}
                    onChange={(t) => taskChangeHandler(t, i)}
                  />
                )}
                {isNote(task.task) && (
                  <Note
                    key={task.task.id}
                    indentation={task.indentation}
                    task={task.task}
                    onChange={(t) => taskChangeHandler(t, i)}
                  />
                )}
                {isFocused(FOCUS.addingTask(i)) && (
                  <FullwidthBox indentation={afterIndent}>
                    <Select key={`${i}-addingTask`} selected={true}>
                      <TextInput
                        prompt='> '
                        onSubmit={(v: string) => newTaskHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )}
                {isFocused(FOCUS.addingNote(i)) && (
                  <FullwidthBox indentation={afterIndent}>
                    <Select key={`${i}-addingNote`} selected={true}>
                      <TextInput
                        prompt='[N] > '
                        onSubmit={(v: string) => newNoteHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )}
                {isFocused(FOCUS.addingFolder(i)) && (
                  <FullwidthBox indentation={afterIndent}>
                    <Select key={`${i}-addingFolder`} selected={true}>
                      <TextInput
                        prompt='[F] > '
                        onSubmit={(v: string) => newFolderHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )}
              </React.Fragment>
            )
          })
        }
      })()}
    </ScrollableList>
  )
}

export default FolderViewTaskList
