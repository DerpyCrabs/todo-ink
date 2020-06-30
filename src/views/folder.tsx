import { Box } from 'ink'
import * as R from 'ramda'
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
import { isFolder, taskPath } from '../utils'

export interface TaskTreeItem {
  indentation: number
  task: FolderType | NoteType | TaskType
  lens: R.Lens
  parentLens: R.Lens
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
      const newPath = [...parentPath, 'tasks', i]
      const currentItem = {
        indentation,
        task: t,
        lens: R.lensPath(newPath),
        parentLens: R.lensPath(parentPath),
        parentIndex: i,
        expanded: expanded.includes(t.id),
      }

      if (isFolder(t) && expanded.includes(t.id)) {
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

export const swap = R.curry((index1, index2, list) => {
  if (
    index1 < 0 ||
    index2 < 0 ||
    index1 > list.length - 1 ||
    index2 > list.length - 1
  ) {
    return list
  }
  const value1 = list[index1]
  const value2 = list[index2]
  return R.pipe(
    R.set(R.lensIndex(index1), value2),
    R.set(R.lensIndex(index2), value1)
  )(list)
})

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
  const resetUndo = useUndo(isFocused(FOCUS.folder(folder.id)))

  React.useEffect(() => {
    resetUndo()
  }, [id, resetUndo])

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
            paste((R.view(tasks[selected].lens, folder) as FolderType).id, 0)
          } else {
            paste((R.view(tasks[selected].parentLens, folder) as FolderType).id, tasks[selected].parentIndex + 1)
          }
        } else {
          paste(folder.id, 0)
        }
      },],
    [hotkeys.isPasteBefore, () => {
        if (selected !== null) {
          paste((R.view(tasks[selected].parentLens, folder) as FolderType).id, tasks[selected].parentIndex)
        } else {
          paste(folder.id, 0)
        }
      },],
    [hotkeys.isMoveDown, () => {
      if (selected !== null) {
        const current = tasks[selected]
        if (selected < tasks.length - 1) {
          const next = tasks[selected + 1]
          if ((R.view(next.parentLens, folder) as FolderType).id === (R.view(current.parentLens, folder) as FolderType).id) {
            if (next.expanded) {
              // moving task into the expanded folder
              setFolder(
                R.over(R.compose(current.parentLens, R.lensProp('tasks')) as R.Lens, R.remove(current.parentIndex, 1),
                  R.over(R.compose(next.lens, R.lensProp('tasks')) as R.Lens, R.prepend(current.task), folder)))
            } else {
              // swap tasks inside of their parent
              setFolder(R.over((R.compose(current.parentLens, R.lensProp('tasks')) as R.Lens), swap(current.parentIndex, current.parentIndex + 1), folder))
            }
          } else {
            if (current.expanded && ((R.view(current.parentLens, folder) as FolderType).tasks.length - 1 !== current.parentIndex)) {
              // swap expanded folder with next parent's task
              setFolder(R.over(R.compose(current.parentLens, R.lensProp('tasks')) as R.Lens, swap(current.parentIndex, current.parentIndex + 1), folder))
            } else {
              // moving task outside of the expanded folder before the next parent task
              const parentOfParentPath = R.dropLast(4, taskPath(folder, current.task.id))
              const parentId = (R.view(current.parentLens, folder) as FolderType).id
              const parentTasks = R.view(R.compose(R.lensPath(parentOfParentPath), R.lensProp('tasks')) as R.Lens, folder) as Array<TaskType | NoteType | FolderType>
              const parentIndex = parentTasks.findIndex(t => t.id === parentId)
              // current task is an expanded folder at the end of parent's tasks
              if (parentId === id) return
              if (parentIndex === -1) throw new Error(`Can't find parent of task ${current.task.id}`)
              setFolder(
                R.over(R.compose(R.lensPath(parentOfParentPath), R.lensProp('tasks')) as R.Lens, R.insert(parentIndex + 1, current.task),
                  R.over(R.compose(current.parentLens, R.lensProp('tasks')) as R.Lens, R.remove(current.parentIndex, 1), folder)))
            }
          }
        } else if ((R.view(current.parentLens, folder) as FolderType).id !== id) {
          // moving task outside of the expanded folder to the parent of parent folder
          const parentOfParentPath = R.dropLast(4, taskPath(folder, current.task.id))
          setFolder(
            R.over(R.compose(R.lensPath(parentOfParentPath), R.lensProp('tasks')) as R.Lens, R.append(current.task),
              R.over(R.compose(current.parentLens, R.lensProp('tasks')) as R.Lens, R.remove(current.parentIndex, 1), folder)))
        }
      }
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
          setFolder(R.over(R.compose(tasks[selected].parentLens, R.lensProp('tasks')) as R.Lens, R.remove(tasks[selected].parentIndex, 1), folder))
          setFocus((focus) => {
            const newFocus = popFocusPure(focus, FOCUS.selectedTask().tag)
            if (tasks.length !== 1) {
              const newSelected =
                tasks.length - 1 === selected
                  ? Math.max(0, selected - 1)
                  : selected
              return pushFocusPure(newFocus, FOCUS.selectedTask(R.remove(selected, 1, tasks)[newSelected].task.id))
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
