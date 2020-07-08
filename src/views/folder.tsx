import produce from 'immer'
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
import { AnyTask, FolderType, TaskId, useFolder } from '../hooks/tasks'
import useUndo from '../hooks/undo'
import { isFolder, taskPath } from '../utils'

const FolderView = ({
  id,
  selected: initialSelection,
}: {
  id: TaskId
  selected?: TaskId
} & RouteProps) => {
  const { folder, setFolder, expanded, setExpanded } = useFolder(id)
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
    [hotkeys.isDeleted, () => {
      go(`/deleted/${folder.id}`)
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
            paste((R.view(R.lensPath(tasks[selected].path), folder) as FolderType).id, 0)
          } else {
            paste((R.view(R.lensPath(tasks[selected].parentPath), folder) as FolderType).id, tasks[selected].parentIndex + 1)
          }
        } else {
          paste(folder.id, 0)
        }
      },],
    [hotkeys.isPasteBefore, () => {
        if (selected !== null) {
          paste((R.view(R.lensPath(tasks[selected].parentPath), folder) as FolderType).id, tasks[selected].parentIndex)
        } else {
          paste(folder.id, 0)
        }
      },],
    [hotkeys.isMoveDown, () => {
      if (selected !== null) {
        const current = tasks[selected]
        if (selected < tasks.length - 1) {
          const next = tasks[selected + 1]
          if ((R.view(R.lensPath(next.parentPath), folder) as FolderType).id === (R.view(R.lensPath(current.parentPath), folder) as FolderType).id) {
            if (next.expanded) {
              // moving task into the expanded folder
              setFolder(moveTask(folder, [...current.parentPath, 'tasks', current.parentIndex], [...next.path, 'tasks', 0]))
            } else {
              // swapping tasks inside of their parent
              setFolder(swapTasks(folder, [...current.parentPath, 'tasks'], current.parentIndex, current.parentIndex + 1))
            }
          } else {
            if (current.expanded && ((R.view(R.lensPath(current.parentPath), folder) as FolderType).tasks.length - 1 !== current.parentIndex)) {
              // swapping expanded folder with next parent's task
              setFolder(swapTasks(folder, [...current.parentPath, 'tasks'], current.parentIndex, current.parentIndex + 1))
            } else {
              // moving task outside of the expanded folder before the next parent task
              const parentOfParentPath = R.dropLast(4, taskPath(folder, current.task.id))
              const parentId = (R.view(R.lensPath(current.parentPath), folder) as FolderType).id
              const parentTasks = R.view(R.lensPath([...parentOfParentPath, 'tasks']), folder) as Array<AnyTask>
              const parentIndex = parentTasks.findIndex(t => t.id === parentId)
              if (parentId === id) {
                // current task is an expanded folder at the end of parent's tasks
                return
              }
              if (parentIndex === -1) throw new Error(`Can't find parent of task ${current.task.id}`)

              setFolder(moveTask(folder, [...current.parentPath, 'tasks', current.parentIndex], [...parentOfParentPath, 'tasks', parentIndex + 1]))
            }
          }
        } else if ((R.view(R.lensPath(current.parentPath), folder) as FolderType).id !== id) {
          // moving task outside of the expanded folder to the parent of parent folder
          const parentOfParentPath = R.dropLast(4, taskPath(folder, current.task.id))
          const parentIndex = (R.view(R.lensPath([...parentOfParentPath, 'tasks']), folder) as FolderType['tasks']).length
          setFolder(moveTask(folder, [...current.parentPath, 'tasks', current.parentIndex], [...parentOfParentPath, 'tasks', parentIndex]))
        }
      }
      },],
    [hotkeys.isMoveUp, () => {
      if (selected !== null && selected !== 0) {
        const prev = tasks[selected - 1]
        const current = tasks[selected]
        if ((R.view(R.lensPath(prev.parentPath), folder) as FolderType).id === (R.view(R.lensPath(current.parentPath), folder) as FolderType).id) {
          if (prev.expanded) {
            // moving task into empty expanded folder above
            setFolder(moveTask(folder, [...current.parentPath, 'tasks', current.parentIndex], [...prev.path, 'tasks', 0]))
          } else {
            // swapping task with previous task in parent
            setFolder(swapTasks(folder, [...current.parentPath, 'tasks'], current.parentIndex, current.parentIndex - 1))
          }
        } else {
          if ((R.view(R.lensPath(current.parentPath), folder) as FolderType).id === (R.view(R.lensPath(prev.path), folder) as FolderType).id) {
            // moving task out of expanded folder
            setFolder(moveTask(folder, [...current.parentPath, 'tasks', current.parentIndex], [...prev.parentPath, 'tasks', prev.parentIndex]))
          } else {
            // moving task into expanded folder
            const prevFolderTasksPath = [...current.parentPath, 'tasks', current.parentIndex - 1, 'tasks']
            const folderIndex = (R.view(R.lensPath(prevFolderTasksPath), folder) as FolderType['tasks']).length
            setFolder(moveTask(folder, [...current.parentPath, 'tasks', current.parentIndex], [...prevFolderTasksPath, folderIndex]))
          }
        }
      }
      },],
    [hotkeys.isDelete, () => {
        if (selected !== null) {
          const task = R.view(R.lensPath([...tasks[selected].parentPath, 'tasks', tasks[selected].parentIndex]), folder) as AnyTask
          const deleted = new Date().toJSON()
          setFolder(R.over(R.lensPath([...tasks[selected].parentPath, 'deleted']), R.prepend({task, deleted}), 
            R.over(R.lensPath([...tasks[selected].parentPath, 'tasks']), R.remove(tasks[selected].parentIndex, 1),
              folder)))

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
          setExpanded(expanded.includes(task.id) ? expanded.filter(t => t !== task.id) : [...expanded, task.id])
        }
      }
    },],
    [hotkeys.isLeave, () => {
      back()
      },],
    [hotkeys.isFolderInfo, () => {
      go(`/task/${folder.id}`)
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

export interface TaskTreeItem {
  indentation: number
  task: AnyTask
  path: Array<string | number>
  parentPath: Array<string | number>
  parentIndex: number
  expanded: boolean
}

const expandTaskTree = (
  tasks: Array<AnyTask>,
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
        path: newPath,
        parentPath,
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

const swapTasks = (
  folder: FolderType,
  path: Array<string | number>,
  i: number,
  j: number
) => {
  return produce(folder, (draftFolder) => {
    let pointer = draftFolder as AnyTask | FolderType['tasks']
    // get to the list of tasks
    const restPath = path.slice().reverse()
    while (restPath.length !== 0) {
      // @ts-ignore
      pointer = pointer[restPath.pop()]
    }
    // swap tasks
    // @ts-ignore
    ;[pointer[i], pointer[j]] = [pointer[j], pointer[i]]
  })
}

const moveTask = (
  folder: FolderType,
  prevPath: Array<string | number>,
  newPath: Array<string | number>
) => {
  return produce(folder, (draftFolder) => {
    // get to the list of tasks out of where task is moved out
    let prevPointer = draftFolder as AnyTask | FolderType['tasks']
    const restPrevPath = prevPath.slice().reverse()
    while (restPrevPath.length !== 1) {
      // @ts-ignore
      prevPointer = prevPointer[restPrevPath.pop()]
    }

    // get to the list of tasks where task is moving in
    let newPointer = draftFolder as AnyTask | FolderType['tasks']
    const restNewPath = newPath.slice().reverse()
    while (restNewPath.length !== 1) {
      // @ts-ignore
      newPointer = newPointer[restNewPath.pop()]
    }

    const prevList = prevPointer as FolderType['tasks']
    const newList = newPointer as FolderType['tasks']
    const prevIndex = restPrevPath[0] as number
    const newIndex = restNewPath[0] as number
    // insert task at position of new path
    newList.splice(newIndex, 0, prevList[prevIndex])
    // remove task from old position
    prevList.splice(prevIndex, 1)
  })
}
