import { Box } from 'ink'
import { insert, lensIndex, remove, set } from 'ramda'
import React from 'react'
import Folder from '../components/folder'
import FolderHeader from '../components/folder-header'
import ScrollableList from '../components/scrollable-list'
import Select from '../components/select'
import Task from '../components/task'
import TextInput from '../components/text-input'
import FOCUS from '../constants/focus'
import {
  isCut,
  isDelete,
  isLeave,
  isMoveDown,
  isMoveUp,
  isNewFolder,
  isNewTask,
  isNewFolderBefore,
  isNewTaskBefore,
  isPaste,
  isPasteBefore,
  isSelectNext,
  isSelectPrev,
  isSearch,
} from '../constants/hotkeys'
import { useClipboard } from '../hooks/clipboard'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { useTasks } from '../hooks/tasks'
import type { FolderType, TaskType, FolderReturnType } from '../hooks/tasks'
import type { AddingFocus } from '../constants/focus'
import { useRouter, RouteProps } from '../hooks/router'
import useUndo from '../hooks/undo'

const FolderView = ({
  id,
  selected: initialSelection,
}: {
  id: FolderType['id']
  selected?: FolderType['id']
} & RouteProps) => {
  const { folder, tasks, newTask, newFolder, setTasks } = useTasks(
    id
  ) as FolderReturnType
  const { isFocused, pushFocus, popFocus, focus, refocus } = useFocus()
  const { back, go } = useRouter()
  const selected = (() => {
    const last = focus[focus.length - 1]
    if (last === undefined) return null
    if (
      last.tag === FOCUS.selectedTask().tag ||
      last.tag === FOCUS.editingTask().tag
    ) {
      const index = tasks.findIndex((t) => t.id === last.id)
      if (index !== -1) {
        return index
      } else {
        return null
      }
    } else {
      return null
    }
  })()

  const { ClipboardStatus, cut, paste } = useClipboard()

  useUndo(isFocused(FOCUS.folder(folder.id)))

  React.useEffect(() => {
    if (
      tasks.length !== 0 &&
      !isFocused(FOCUS.selectedTask().tag) &&
      !isFocused(FOCUS.addingTask().tag) &&
      !isFocused(FOCUS.addingFolder().tag)
    ) {
      if (initialSelection !== undefined) {
        pushFocus(FOCUS.selectedTask(initialSelection))
      } else {
        pushFocus(FOCUS.selectedTask(tasks[0].id))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder.id, initialSelection, tasks[0]])

  const taskChangeHandler = (task: TaskType | FolderType, i: number) => {
    setTasks(set(lensIndex(i), task, tasks))
  }

  const newTaskHandler = (v: string, i: number) => {
    popFocus(FOCUS.addingTask().tag)
    if (v.trim()) {
      const task = newTask(v, false)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.selectedTask(task.id))
    }
  }
  const newFolderHandler = (v: string, i: number) => {
    popFocus(FOCUS.addingFolder().tag)
    if (v.trim()) {
      const task = newFolder(v)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.selectedTask(task.id))
    }
  }

  const newTaskCancelHandler = () => {
    popFocus(FOCUS.addingTask().tag)
  }
  const newFolderCancelHandler = () => {
    popFocus(FOCUS.addingFolder().tag)
  }

  // prettier-ignore
  useHotkeys([
    [isSearch, () => {
      go(`/search/${folder.id}`)
    }],
    [isSelectNext, () => {
        if (selected !== null && selected !== tasks.length - 1) {
          refocus(FOCUS.selectedTask(tasks[selected + 1].id))
        }
      },],
    [isSelectPrev, () => {
        if (selected !== null && selected !== 0) {
          refocus(FOCUS.selectedTask(tasks[selected - 1].id))
        }
      },],
    [isCut, () => {
        if (selected !== null) {
          if (selected === 0 && tasks.length === 1) {
            popFocus(FOCUS.selectedTask().tag)
          } else if (selected === tasks.length - 1) {
            refocus(FOCUS.selectedTask(tasks[selected - 1].id))
          } else {
            refocus(FOCUS.selectedTask(tasks[selected + 1].id))
          }
          cut(tasks[selected].id)
        }
      },],
    [isPaste, () => {
        paste(folder.id, selected !== null ? selected + 1 : 0)
      },],
    [isPasteBefore, () => {
        paste(folder.id, selected !== null ? selected : 0)
      },],
    [isMoveDown, () => {
        if (selected !== null && selected < tasks.length - 1) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.selectedTask(tc[selected + 1].id))
        }
      },],
    [isMoveUp, () => {
        if (selected !== null && selected > 0) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected - 1]] = [tc[selected - 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.selectedTask(tc[selected - 1].id))
        }
      },],
    [isDelete, () => {
        if (selected !== null) {
          setTasks(remove(selected, 1, tasks))
          popFocus(FOCUS.selectedTask().tag)
          if (tasks.length !== 1) {
            const newSelected =
              tasks.length - 1 === selected
                ? Math.max(0, selected - 1)
                : selected
            pushFocus(FOCUS.selectedTask(remove(selected, 1, tasks)[newSelected].id))
          }
        }
      },],
    [isNewTask, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingTask(selected + 1))
      } else {
        pushFocus(FOCUS.addingTask(0))
      }
      },],
    [isNewFolder, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingFolder(selected + 1))
      } else {
        pushFocus(FOCUS.addingFolder(0))
      }
      },],
    [isNewTaskBefore, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingTask(selected))
      } else {
        pushFocus(FOCUS.addingTask(0))
      }
      },],
    [isNewFolderBefore, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingFolder(selected))
      } else {
        pushFocus(FOCUS.addingFolder(0))
      }
      },],
    [isLeave, () => {
      back()
      },],
    ], isFocused(FOCUS.folder(folder.id)))

  return (
    <Box flexDirection='column'>
      <FolderHeader folderId={folder.id} />
      <ScrollableList
        position={(() => {
          if (
            isFocused(FOCUS.addingTask().tag) ||
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
          let children: Array<React.ReactElement> = []
          let task_index = 0
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
            } else if (task_index < tasks.length) {
              children.push(
                'tasks' in tasks[task_index] ? (
                  <Folder
                    key={i}
                    task={tasks[task_index] as FolderType}
                    onChange={(t) => taskChangeHandler(t, i)}
                  />
                ) : (
                  <Task
                    key={i}
                    task={tasks[task_index] as TaskType}
                    onChange={(t) => taskChangeHandler(t, i)}
                  />
                )
              )
              task_index += 1
            }
          }
          return children
        })()}
      </ScrollableList>
      <ClipboardStatus />
    </Box>
  )
}

export default FolderView
