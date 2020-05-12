import { Box } from 'ink'
import { remove } from 'ramda'
import React from 'react'
import FolderHeader from '../components/folder-header'
import FolderViewTaskList from '../components/folder-task-list'
import FOCUS from '../constants/focus'
import {
  isCut,
  isDelete,
  isLeave,
  isMoveDown,
  isMoveUp,
  isNewFolder,
  isNewFolderBefore,
  isNewNote,
  isNewNoteBefore,
  isNewTask,
  isNewTaskBefore,
  isPaste,
  isPasteBefore,
  isSearch,
  isSelectNext,
  isSelectPrev,
} from '../constants/hotkeys'
import { useClipboard } from '../hooks/clipboard'
import {
  popFocus as popFocusPure,
  pushFocus as pushFocusPure,
  useFocus,
} from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { RouteProps, useRouter } from '../hooks/router'
import { TaskId, useFolder } from '../hooks/tasks'
import useUndo from '../hooks/undo'

const FolderView = ({
  id,
  selected: initialSelection,
}: {
  id: TaskId
  selected?: TaskId
} & RouteProps) => {
  const { folder, tasks, setTasks } = useFolder(id)

  const {
    isFocused,
    pushFocus,
    popFocus,
    focus,
    refocus,
    setFocus,
  } = useFocus()
  const { back, go } = useRouter()
  const { ClipboardStatus, cut, paste } = useClipboard()
  useUndo(isFocused(FOCUS.folder(folder.id)))

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

  React.useEffect(() => {
    if (
      tasks.length !== 0 &&
      !isFocused(FOCUS.selectedTask().tag) &&
      !isFocused(FOCUS.addingTask().tag) &&
      !isFocused(FOCUS.addingNote().tag) &&
      !isFocused(FOCUS.addingFolder().tag)
    ) {
      if (initialSelection !== undefined) {
        refocus(FOCUS.selectedTask(initialSelection))
      } else {
        refocus(FOCUS.selectedTask(tasks[0].id))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder.id, initialSelection, tasks[0]])

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
          const tc = tasks.slice()
          ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.selectedTask(tc[selected + 1].id))
        }
      },],
    [isMoveUp, () => {
        if (selected !== null && selected > 0) {
          const tc = tasks.slice()
          ;[tc[selected], tc[selected - 1]] = [tc[selected - 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.selectedTask(tc[selected - 1].id))
        }
      },],
    [isDelete, () => {
        if (selected !== null) {
          setTasks(remove(selected, 1, tasks))
          setFocus((focus) => {
            const newFocus = popFocusPure(focus, FOCUS.selectedTask().tag)
            if (tasks.length !== 1) {
              const newSelected =
                tasks.length - 1 === selected
                  ? Math.max(0, selected - 1)
                  : selected
              return pushFocusPure(newFocus, FOCUS.selectedTask(remove(selected, 1, tasks)[newSelected].id))
            } else {
              return newFocus
            }
          })
        }
      },],
    [isNewTask, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingTask(selected + 1))
      } else {
        pushFocus(FOCUS.addingTask(0))
      }
      },],
    [isNewNote, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingNote(selected + 1))
      } else {
        pushFocus(FOCUS.addingNote(0))
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
    [isNewNoteBefore, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingNote(selected))
      } else {
        pushFocus(FOCUS.addingNote(0))
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
      <FolderViewTaskList id={folder.id} selected={selected} />
      <ClipboardStatus />
    </Box>
  )
}

export default FolderView
