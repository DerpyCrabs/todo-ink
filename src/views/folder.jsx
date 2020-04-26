import React from 'react'
import { Box, useStdin } from 'ink'
import useInput from '../hooks/input'
import { useTasks } from '../hooks/tasks'
import Task from '../components/task'
import Folder from '../components/folder'
import Select from '../components/select'
import { UncontrolledTextInput } from '../components/text-input'
import { useFocus } from '../hooks/focus'
import { useClipboard } from '../hooks/clipboard'
import { remove, lensIndex, set, insert } from 'ramda'
import FOCUS from '../constants/focus'
import ScrollableList from '../components/scrollable-list'
import { allTasksCount, completedTasksCount } from '../components/folder'
import {
  isMoveUp,
  isMoveDown,
  isDelete,
  isNewTask,
  isNewFolder,
  isCut,
  isPaste,
  isLeave,
  isSelectPrev,
  isSelectNext,
} from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'

const FolderView = ({ folder }) => {
  const { tasks, newTask, newFolder, setTasks } = useTasks(folder.id)
  const { isFocused, pushFocus, popFocus, focus, refocus } = useFocus()
  const selected = (() => {
    const last = focus[focus.length - 1]
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
    if (tasks.length !== 0 && !isFocused(FOCUS.task().tag)) {
      pushFocus(FOCUS.task(tasks[0].id))
    }
  }, [folder.id])

  const taskChangeHandler = (task, i) => {
    setTasks(set(lensIndex(i), task, tasks))
  }

  const newTaskHandler = (v, i) => {
    popFocus(FOCUS.addingTask().tag)
    if (v.trim()) {
      const task = newTask(v, false)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.task(task.id))
    }
  }
  const newFolderHandler = (v, i) => {
    popFocus(FOCUS.addingFolder().tag)
    if (v.trim()) {
      const task = newFolder(v)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.task(task.id))
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
        if (selected < tasks.length - 1) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.task(tc[selected + 1].id))
        }
      },],
    [isMoveUp, () => {
        if (selected > 0) {
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
        if (focus.length !== 2) {
          popFocus(FOCUS.task().tag)
          popFocus(FOCUS.folder().tag)
        }
      },],
    ], isFocused(FOCUS.folder(folder.id, folder.name)))

  return (
    <Box flexDirection='column'>
      <Box>
        {'    '}Folder: {folderPath(focus)} ({completedTasksCount(tasks)}/
        {allTasksCount(tasks)})
      </Box>
      <ScrollableList
        position={(() => {
          if (
            isFocused(FOCUS.addingTask().tag) ||
            isFocused(FOCUS.addingFolder().tag)
          ) {
            const addingPosition = focus[focus.length - 1].after
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
            task.tasks === undefined ? (
              <Task
                key={i}
                task={task}
                onChange={(t) => taskChangeHandler(t, i)}
              />
            ) : (
              <Folder
                key={i}
                task={task}
                onChange={(t) => taskChangeHandler(t, i)}
              />
            ),
          ],
          ...[
            isFocused(FOCUS.addingTask(i)) && (
              <Select key={`${i}-addingTask`} selected={true}>
                <UncontrolledTextInput
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
                <UncontrolledTextInput
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
            <UncontrolledTextInput
              prompt='> '
              onSubmit={(v) => newTaskHandler(v, 0)}
              onCancel={newTaskCancelHandler}
            />
          </Select>
        )}
        {isFocused(FOCUS.addingFolder(null)) && (
          <Select selected={true}>
            <UncontrolledTextInput
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

function folderPath(focus) {
  const folders = focus
    .filter((f) => f.tag === FOCUS.folder().tag)
    .map((f) => f.name)
  return '/' + folders.slice(1).join('/')
}

export default FolderView
