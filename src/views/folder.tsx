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
  isPaste,
  isSelectNext,
  isSelectPrev,
} from '../constants/hotkeys'
import { useClipboard } from '../hooks/clipboard'
import { useFocus } from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { useTasks } from '../hooks/tasks'
import type { FolderType, TaskType, TaskReturnType } from '../hooks/tasks'
import type { AddingFocus } from '../constants/focus'
import { useRouter } from '../hooks/router'

const FolderView = ({ folderId }: { folderId: FolderType['id'] }) => {
  const { folder, tasks, newTask, newFolder, setTasks } = useTasks(
    folderId
  ) as TaskReturnType
  const {
    isFocused,
    pushFocus,
    popFocus,
    focus,
    refocus,
    initialFocus,
  } = useFocus()
  const { back } = useRouter()
  const selected = (() => {
    const last = focus[focus.length - 1]
    if (last === undefined) return null
    if (last.tag === 'task' || last.tag === 'editing') {
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

  React.useEffect(() => {
    initialFocus(FOCUS.folder(folderId))
    if (tasks.length !== 0) {
      pushFocus(FOCUS.task(tasks[0].id))
    }
    // select first task on initial rendering of folder
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId])

  const taskChangeHandler = (task: TaskType | FolderType, i: number) => {
    setTasks(set(lensIndex(i), task, tasks))
  }

  const newTaskHandler = (v: string, i: number) => {
    popFocus(FOCUS.addingTask(null).tag)
    if (v.trim()) {
      const task = newTask(v, false)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.task(task.id))
    }
  }
  const newFolderHandler = (v: string, i: number) => {
    popFocus(FOCUS.addingFolder(null).tag)
    if (v.trim()) {
      const task = newFolder(v)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.task(task.id))
    }
  }

  const newTaskCancelHandler = () => {
    popFocus(FOCUS.addingTask(null).tag)
  }
  const newFolderCancelHandler = () => {
    popFocus(FOCUS.addingFolder(null).tag)
  }

  // prettier-ignore
  useHotkeys([
    [isSelectNext, () => {
        if (selected !== null && selected !== tasks.length - 1) {
          refocus(FOCUS.task(tasks[selected + 1].id))
        }
      },],
    [isSelectPrev, () => {
        if (selected !== null && selected !== 0) {
          refocus(FOCUS.task(tasks[selected - 1].id))
        }
      },],
    [isCut, () => {
        if (selected !== null) {
          if (selected === 0 && tasks.length !== 1) {
            refocus(FOCUS.task(tasks[1].id))
          } else if (selected === 0 && tasks.length === 1) {
            popFocus(FOCUS.task().tag)
          } else {
            refocus(FOCUS.task(tasks[selected - 1].id))
          }
          cut(tasks[selected].id)
        }
      },],
    [isPaste, () => {
        paste(folder.id, selected !== null ? selected + 1 : 0)
      },],
    [isMoveDown, () => {
        if (selected !== null && selected < tasks.length - 1) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.task(tc[selected + 1].id))
        }
      },],
    [isMoveUp, () => {
        if (selected !== null && selected > 0) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected - 1]] = [tc[selected - 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.task(tc[selected - 1].id))
        }
      },],
    [isDelete, () => {
        if (selected !== null) {
          setTasks(remove(selected, 1, tasks))
          popFocus(FOCUS.task().tag)
          if (tasks.length !== 1) {
            const newSelected =
              tasks.length - 1 === selected
                ? Math.max(0, selected - 1)
                : selected
            pushFocus(FOCUS.task(remove(selected, 1, tasks)[newSelected].id))
          }
        }
      },],
    [isNewTask, () => {
        pushFocus(FOCUS.addingTask(selected))
      },],
    [isNewFolder, () => {
        pushFocus(FOCUS.addingFolder(selected))
      },],
    [isLeave, () => {
      back()
      },],
    ], isFocused(FOCUS.folder(folder.id)))

  return (
    <Box flexDirection='column'>
      <FolderHeader folderId={folderId} />
      <ScrollableList
        position={(() => {
          if (
            isFocused(FOCUS.addingTask(null).tag) ||
            isFocused(FOCUS.addingFolder(null).tag)
          ) {
            const addingPosition = (focus[focus.length - 1] as AddingFocus)
              .after
            if (addingPosition !== null) {
              return addingPosition + 1
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
        {tasks.map((task, i) => [
          ...[
            'tasks' in task ? (
              <Folder
                key={i}
                task={task}
                onChange={(t) => taskChangeHandler(t, i)}
              />
            ) : (
              <Task
                key={i}
                task={task}
                onChange={(t) => taskChangeHandler(t, i)}
              />
            ),
          ],
          ...[
            isFocused(FOCUS.addingTask(i)) && (
              <Select key={`${i}-addingTask`} selected={true}>
                <TextInput
                  prompt='> '
                  onSubmit={(v) => newTaskHandler(v, i + 1)}
                  onCancel={newTaskCancelHandler}
                />
              </Select>
            ),
          ],
          ...[
            isFocused(FOCUS.addingFolder(i)) && (
              <Select key={`${i}-addingFolder`} selected={true}>
                <TextInput
                  prompt='[F] > '
                  onSubmit={(v) => newFolderHandler(v, i + 1)}
                  onCancel={newFolderCancelHandler}
                />
              </Select>
            ),
          ],
        ])}
        {isFocused(FOCUS.addingTask(null)) && (
          <Select selected={true}>
            <TextInput
              prompt='> '
              onSubmit={(v) => newTaskHandler(v, 0)}
              onCancel={newTaskCancelHandler}
            />
          </Select>
        )}
        {isFocused(FOCUS.addingFolder(null)) && (
          <Select selected={true}>
            <TextInput
              prompt='[F] > '
              onSubmit={(v) => newFolderHandler(v, 0)}
              onCancel={newFolderCancelHandler}
            />
          </Select>
        )}
      </ScrollableList>
      <ClipboardStatus />
    </Box>
  )
}

export default FolderView