import { Lens, compose, insert, lensProp, over, set } from 'ramda'
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
          return tasks
            .map((task, i) => {
              const beforeIndent = task.indentation
              const afterIndent = task.expanded
                ? task.indentation + 1
                : task.indentation
              const children = [] as Array<React.ReactNode>
              if (isFocused(FOCUS.addingTaskBefore(i)))
                children.push(
                  <FullwidthBox
                    key={`${i}-addingTaskBefore`}
                    indentation={beforeIndent}
                  >
                    <Select selected={true}>
                      <TextInput
                        prompt='> '
                        onSubmit={(v: string) => newTaskBeforeHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )
              if (isFocused(FOCUS.addingNoteBefore(i)))
                children.push(
                  <FullwidthBox
                    key={`${i}-addingNoteBefore`}
                    indentation={beforeIndent}
                  >
                    <Select selected={true}>
                      <TextInput
                        prompt='[N] > '
                        onSubmit={(v: string) => newNoteBeforeHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )
              if (isFocused(FOCUS.addingFolderBefore(i)))
                children.push(
                  <FullwidthBox
                    key={`${i}-addingFolderBefore`}
                    indentation={beforeIndent}
                  >
                    <Select selected={true}>
                      <TextInput
                        prompt='[F] > '
                        onSubmit={(v: string) => newFolderBeforeHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )
              if (isFolder(task.task))
                children.push(
                  <Folder
                    key={task.task.id}
                    indentation={task.indentation}
                    task={task.task}
                    onChange={(t) => taskChangeHandler(t, i)}
                    expanded={task.expanded}
                  />
                )
              if (isTask(task.task))
                children.push(
                  <Task
                    key={task.task.id}
                    indentation={task.indentation}
                    task={task.task}
                    onChange={(t) => taskChangeHandler(t, i)}
                  />
                )
              if (isNote(task.task))
                children.push(
                  <Note
                    key={task.task.id}
                    indentation={task.indentation}
                    task={task.task}
                    onChange={(t) => taskChangeHandler(t, i)}
                  />
                )
              if (isFocused(FOCUS.addingTask(i)))
                children.push(
                  <FullwidthBox
                    key={`${i}-addingTask`}
                    indentation={afterIndent}
                  >
                    <Select selected={true}>
                      <TextInput
                        prompt='> '
                        onSubmit={(v: string) => newTaskHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )
              if (isFocused(FOCUS.addingNote(i)))
                children.push(
                  <FullwidthBox
                    key={`${i}-addingNote`}
                    indentation={afterIndent}
                  >
                    <Select selected={true}>
                      <TextInput
                        prompt='[N] > '
                        onSubmit={(v: string) => newNoteHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )
              if (isFocused(FOCUS.addingFolder(i)))
                children.push(
                  <FullwidthBox
                    key={`${i}-addingFolder`}
                    indentation={afterIndent}
                  >
                    <Select selected={true}>
                      <TextInput
                        prompt='[F] > '
                        onSubmit={(v: string) => newFolderHandler(v, i)}
                        onCancel={popFocus}
                      />
                    </Select>
                  </FullwidthBox>
                )
              return children
            })
            .flat()
        }
      })()}
    </ScrollableList>
  )
}

export default FolderViewTaskList
