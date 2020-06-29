import { Box } from 'ink'
import { Lens, compose, lensPath, lensProp, over, remove, view } from 'ramda'
import React from 'react'
import FolderHeader from '../components/folder-header'
import FolderViewTaskList from '../components/folder-task-list'
import FOCUS from '../constants/focus'
import * as hotkeys from '../constants/hotkeys'
import { useClipboard } from '../hooks/clipboard'
import {
  popFocus as popFocusPure,
  pushFocus as pushFocusPure,
  useFocus,
} from '../hooks/focus'
import useHotkeys from '../hooks/hotkeys'
import { RouteProps, useRouter } from '../hooks/router'
import {
  FolderType,
  NoteType,
  TaskId,
  TaskType,
  useFolder,
} from '../hooks/tasks'
import useUndo from '../hooks/undo'
import { isFolder } from '../utils'

export interface TaskTreeItem {
  indentation: number
  task: FolderType | NoteType | TaskType
  lens: Lens
  parentLens: Lens
  parentIndex: number
  expanded: boolean
}

const expandTaskTree = (
  tasks: Array<FolderType | NoteType | TaskType>,
  expanded: Array<TaskId>,
  indentation: number,
  parentPath: Array<number | string>
): Array<TaskTreeItem> => {
  return tasks
    .map((t, i) => {
      const currentItem = {
        indentation,
        task: t,
        lens: lensPath([...parentPath, 'tasks', i]),
        parentLens: lensPath(parentPath),
        parentIndex: i,
        expanded: expanded.includes(t.id),
      }

      if (isFolder(t) && expanded.includes(t.id)) {
        const newPath = [...parentPath, 'tasks', i]
        return [
          currentItem,
          ...expandTaskTree(t.tasks, expanded, indentation + 1, newPath),
        ]
      } else {
        return [currentItem]
      }
    })
    .flat()
}

const FolderView = ({
  id,
  selected: initialSelection,
}: {
  id: TaskId
  selected?: TaskId
} & RouteProps) => {
  // TODO save expanded state to global context
  // TODO check that entering task in expanded folder and leaving works as expected
  const [expanded, setExpanded] = React.useState([id])
  const { folder, setFolder } = useFolder(id)
  const tasks = expandTaskTree(folder.tasks, expanded, 0, [])

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
      const index = tasks.findIndex((t) => t.task.id === last.id)
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
      isFocused(FOCUS.folder(id))
    ) {
      if (initialSelection !== undefined) {
        refocus(FOCUS.selectedTask(initialSelection))
      } else {
        refocus(FOCUS.selectedTask(tasks[0].task.id))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder.id, initialSelection, tasks[0]])

  // prettier-ignore
  useHotkeys([
    [hotkeys.isSearch, () => {
      go(`/search/${folder.id}`)
    }],
    [hotkeys.isSelectNext, () => {
        if (selected !== null && selected !== tasks.length - 1) {
          refocus(FOCUS.selectedTask(tasks[selected + 1].task.id))
        }
      },],
    [hotkeys.isSelectPrev, () => {
        if (selected !== null && selected !== 0) {
          refocus(FOCUS.selectedTask(tasks[selected - 1].task.id))
        }
      },],
    [hotkeys.isCut, () => {
        if (selected !== null) {
          if (selected === 0 && tasks.length === 1) {
            popFocus(FOCUS.selectedTask().tag)
          } else if (selected === tasks.length - 1) {
            refocus(FOCUS.selectedTask(tasks[selected - 1].task.id))
          } else {
            refocus(FOCUS.selectedTask(tasks[selected + 1].task.id))
          }
          cut(tasks[selected].task.id)
        }
      },],
    [hotkeys.isPaste, () => {
        if (selected !== null) {
          if (tasks[selected].expanded) {
            paste((view(tasks[selected].lens, folder) as FolderType).id, 0)
          } else {
            paste((view(tasks[selected].parentLens, folder) as FolderType).id, tasks[selected].parentIndex + 1)
          }
        } else {
          paste(folder.id, 0)
        }
      },],
    [hotkeys.isPasteBefore, () => {
        if (selected !== null) {
          paste((view(tasks[selected].parentLens, folder) as FolderType).id, tasks[selected].parentIndex)
        } else {
          paste(folder.id, 0)
        }
      },],
    [hotkeys.isMoveDown, () => {
      // TODO fix based on lens
        // if (selected !== null && selected < tasks.length - 1) {
        //   const tc = tasks.slice()
        //   ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
        //   setTasks(tc)
        //   refocus(FOCUS.selectedTask(tc[selected + 1].id))
        // }
      },],
    [hotkeys.isMoveUp, () => {
      // TODO fix based on lens
        // if (selected !== null && selected > 0) {
        //   const tc = tasks.slice()
        //   ;[tc[selected], tc[selected - 1]] = [tc[selected - 1], tc[selected]]
        //   setTasks(tc)
        //   refocus(FOCUS.selectedTask(tc[selected - 1].id))
        // }
      },],
    [hotkeys.isDelete, () => {
        if (selected !== null) {
          setFolder(over(compose(tasks[selected].parentLens, lensProp('tasks')) as Lens, remove(tasks[selected].parentIndex, 1), folder))
          setFocus((focus) => {
            const newFocus = popFocusPure(focus, FOCUS.selectedTask().tag)
            if (tasks.length !== 1) {
              const newSelected =
                tasks.length - 1 === selected
                  ? Math.max(0, selected - 1)
                  : selected
              return pushFocusPure(newFocus, FOCUS.selectedTask(remove(selected, 1, tasks)[newSelected].task.id))
            } else {
              return newFocus
            }
          })
        }
      },],
    [hotkeys.isNewTask, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingTask(selected))
      } else {
        pushFocus(FOCUS.addingTask(0))
      }
      },],
    [hotkeys.isNewNote, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingNote(selected))
      } else {
        pushFocus(FOCUS.addingNote(0))
      }
      },],
    [hotkeys.isNewFolder, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingFolder(selected))
      } else {
        pushFocus(FOCUS.addingFolder(0))
      }
      },],
    [hotkeys.isNewTaskBefore, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingTaskBefore(selected))
      } else {
        pushFocus(FOCUS.addingTask(0))
      }
      },],
    [hotkeys.isNewNoteBefore, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingNoteBefore(selected))
      } else {
        pushFocus(FOCUS.addingNote(0))
      }
      },],
    [hotkeys.isNewFolderBefore, () => {
      if (selected !== null) {
        pushFocus(FOCUS.addingFolderBefore(selected))
      } else {
        pushFocus(FOCUS.addingFolder(0))
      }
      },],
    [hotkeys.isExpand, () => {
      if (selected !== null) {
        const task = tasks[selected].task
        if (isFolder(task)) {
          setExpanded(expanded => expanded.includes(task.id) ? expanded.filter(t => t !== task.id) : [...expanded, task.id])
        }
      }
    },],
    [hotkeys.isLeave, () => {
      back()
      },],
    ], isFocused(FOCUS.folder(folder.id)))

  return (
    <Box flexDirection='column'>
      <FolderHeader folderId={folder.id} />
      <FolderViewTaskList id={folder.id} tasks={tasks} selected={selected} />
      <ClipboardStatus />
    </Box>
  )
}

export default FolderView
