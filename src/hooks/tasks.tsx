import { existsSync, readFileSync, writeFileSync } from 'fs'
import * as R from 'ramda'
import type { Lens } from 'ramda'
import React from 'react'
import { isNote, isTask, taskPath } from '../utils'

function readTasks(path: string) {
  const addDates = (task: AnyTask): AnyTask => {
    if (isTask(task) || isNote(task)) {
      if (
        task.creationDate === undefined ||
        task.modificationDate === undefined
      ) {
        return {
          ...task,
          creationDate: new Date().toJSON(),
          modificationDate: new Date().toJSON(),
        }
      } else {
        return task
      }
    } else {
      if (
        task.creationDate === undefined ||
        task.modificationDate === undefined
      ) {
        return {
          ...task,
          creationDate: new Date().toJSON(),
          modificationDate: new Date().toJSON(),
          tasks: task.tasks.map((t) => addDates(t)),
        }
      } else {
        return { ...task, tasks: task.tasks.map((t) => addDates(t)) }
      }
    }
  }

  if (existsSync(path)) {
    const content = readFileSync(path)
    const tasks = JSON.parse(content.toString())
    if (tasks.id === undefined) {
      return {
        id: Math.max(0, ...tasks.map((t: TaskType) => t.id)) + 1,
        name: 'root',
        creationDate: new Date().toJSON(),
        modificationDate: new Date().toJSON(),
        tasks: tasks.map((t: AnyTask) => addDates(t)),
      }
    } else {
      return addDates(tasks) as FolderType
    }
  } else {
    return {
      id: 0,
      name: 'root',
      creationDate: new Date().toJSON(),
      modificationDate: new Date().toJSON(),
      tasks: [],
    }
  }
}

function writeTasks(path: string, tasks: FolderType) {
  writeFileSync(path, JSON.stringify(tasks))
}

function maxId(tasks: AnyTask): TaskId {
  if (isTask(tasks) || isNote(tasks)) {
    return tasks.id
  }
  return Math.max(
    tasks.id,
    ...(tasks.tasks as Array<AnyTask>).map((t: AnyTask) => maxId(t))
  )
}

const TasksContext = React.createContext<TasksContextType>({
  tasks: {
    lastId: 0,
    tasks: {
      id: 0,
      name: 'root',
      tasks: [],
      creationDate: new Date().toJSON(),
      modificationDate: new Date().toJSON(),
    },
    expandedFolders: [] as ExpandedFoldersType,
  },
  setTasks: () => {},
})

export const TasksProvider = React.memo(
  ({
    children,
    path = 'tasks.json',
  }: {
    children: React.ReactNode
    path: string
  }) => {
    const tmpTasks = readTasks(path)
    const [tasks, setTasks] = React.useState({
      lastId: maxId(tmpTasks),
      tasks: tmpTasks,
      expandedFolders: [] as ExpandedFoldersType,
    })
    const setTasksHandler = React.useCallback(
      (tasksHandler: SetTasksHandler) => {
        setTasks((tasks) => {
          const newTasks = tasksHandler(tasks)
          writeTasks(path, newTasks.tasks)
          return newTasks
        })
      },
      [path]
    )
    return (
      <TasksContext.Provider value={{ tasks, setTasks: setTasksHandler }}>
        {children}
      </TasksContext.Provider>
    )
  }
)

export function useTask(taskId: TaskId): TaskReturnType {
  const {
    tasks: { tasks },
    setTasks,
  } = React.useContext(TasksContext)

  const path = React.useMemo(() => taskPath(tasks, taskId), [tasks, taskId])
  const taskLens = React.useMemo(() => R.lensPath(path), [path])

  const setTaskHandler = React.useCallback(
    (t: TaskType) => {
      setTasks(({ tasks, lastId, expandedFolders }) => {
        if (!R.equals(t, R.view(taskLens, tasks))) {
          return {
            tasks: R.set(
              taskLens,
              { ...t, modificationDate: new Date().toJSON() },
              tasks
            ),
            lastId,
            expandedFolders,
          }
        } else {
          return { tasks, lastId, expandedFolders }
        }
      })
    },
    [setTasks, taskLens]
  )

  return {
    task: R.view(taskLens, tasks),
    setTask: setTaskHandler,
  }
}

export function useNote(taskId: TaskId): NoteReturnType {
  const {
    tasks: { tasks },
    setTasks,
  } = React.useContext(TasksContext)

  const path = React.useMemo(() => taskPath(tasks, taskId), [tasks, taskId])
  const noteLens = React.useMemo(() => R.lensPath(path), [path])

  const setNoteHandler = React.useCallback(
    (n: NoteType) => {
      setTasks(({ tasks, lastId, expandedFolders }) => {
        if (!R.equals(n, R.view(noteLens, tasks))) {
          return {
            tasks: R.set(
              noteLens,
              { ...n, modificationDate: new Date().toJSON() },
              tasks
            ),
            lastId,
            expandedFolders,
          }
        } else {
          return { tasks, lastId, expandedFolders }
        }
      })
    },
    [setTasks, noteLens]
  )

  return {
    note: R.view(noteLens, tasks),
    setNote: setNoteHandler,
  }
}

export function useTasks(): RootFolderReturnType {
  const {
    tasks: { tasks },
    setTasks,
  } = React.useContext(TasksContext)
  const setRoot = React.useCallback(
    (t: FolderType) =>
      setTasks(({ lastId, expandedFolders }) => ({
        tasks: t,
        lastId,
        expandedFolders,
      })),
    [setTasks]
  )
  return {
    root: tasks,
    setRoot,
  }
}

export function useFolder(folderId: TaskId): FolderReturnType {
  const {
    tasks: { tasks, lastId, expandedFolders },
    setTasks,
  } = React.useContext(TasksContext)

  const folderPath = React.useMemo(() => taskPath(tasks, folderId), [
    tasks,
    folderId,
  ])
  const folderLens = React.useMemo(() => R.lensPath(folderPath), [folderPath])

  const newTask = React.useCallback(
    (name: string) => {
      setTasks(({ tasks, lastId, expandedFolders }) => ({
        tasks,
        lastId: lastId + 1,
        expandedFolders,
      }))
      return {
        id: lastId + 1,
        name,
        status: false,
        description: '',
        creationDate: new Date().toJSON(),
        modificationDate: new Date().toJSON(),
      }
    },
    [lastId, setTasks]
  )

  const newFolder = React.useCallback(
    (name: string) => {
      setTasks(({ tasks, lastId, expandedFolders }) => ({
        tasks,
        lastId: lastId + 1,
        expandedFolders,
      }))
      return {
        id: lastId + 1,
        name,
        tasks: [],
        creationDate: new Date().toJSON(),
        modificationDate: new Date().toJSON(),
      }
    },
    [lastId, setTasks]
  )

  const newNote = React.useCallback(
    (name: string) => {
      setTasks(({ tasks, lastId, expandedFolders }) => ({
        tasks,
        lastId: lastId + 1,
        expandedFolders,
      }))
      return {
        id: lastId + 1,
        name,
        description: '',
        creationDate: new Date().toJSON(),
        modificationDate: new Date().toJSON(),
      }
    },
    [lastId, setTasks]
  )

  const setFolderHandler = React.useCallback(
    (newFolder: FolderType) => {
      setTasks(({ tasks, lastId, expandedFolders }) => {
        const oldFolder = R.view(folderLens, tasks) as FolderType
        const updatedTasks = newFolder.tasks.map((task) => {
          const oldTask = oldFolder.tasks.find((t) => t.id === task.id)
          if (
            oldTask !== undefined &&
            (isNote(task) || isTask(task)) &&
            !R.equals(oldTask, task)
          ) {
            return { ...task, modificationDate: new Date().toJSON() }
          } else {
            return task
          }
        })

        const updatedFolder = R.set(
          folderLens,
          { ...newFolder, tasks: updatedTasks },
          tasks
        )

        if (!R.equals(oldFolder, updatedFolder)) {
          return {
            tasks: R.set(
              R.compose(folderLens, R.lensProp('modificationDate')) as Lens,
              new Date().toJSON(),
              updatedFolder
            ),
            lastId,
            expandedFolders,
          }
        } else {
          return { tasks, lastId, expandedFolders }
        }
      })
    },
    [folderLens, setTasks]
  )

  const setTasksHandler = React.useCallback(
    (newTasks: Array<AnyTask>) =>
      setFolderHandler({ ...R.view(folderLens, tasks), tasks: newTasks }),
    [folderLens, setFolderHandler, tasks]
  )

  const expandedMemoized = React.useMemo(() => {
    const expandedFolder = expandedFolders.find((f) => f.id === folderId)
    if (expandedFolder === undefined) {
      return []
    } else {
      return expandedFolder.expanded
    }
  }, [folderId, expandedFolders])

  const setExpandedHandler = React.useCallback(
    (expanded: Array<TaskId>) =>
      setTasks((tasks) => {
        const expandedFolderIndex = tasks.expandedFolders.findIndex(
          (f) => f.id === folderId
        )
        if (expandedFolderIndex === -1) {
          return R.over(
            R.lensProp('expandedFolders'),
            R.append({ id: folderId, expanded }),
            tasks
          )
        } else {
          return R.set(
            R.compose(
              R.lensProp('expandedFolders'),
              R.lensIndex(expandedFolderIndex),
              R.lensProp('expanded')
            ) as Lens,
            expanded,
            tasks
          )
        }
      }),
    [folderId, setTasks]
  )

  return {
    tasks: R.view(R.compose(folderLens, R.lensProp('tasks')) as Lens, tasks),
    folder: R.view(folderLens, tasks),
    expanded: expandedMemoized,
    setExpanded: setExpandedHandler,
    setFolder: setFolderHandler,
    setTasks: setTasksHandler,
    newTask,
    newFolder,
    newNote,
  }
}

export interface RootFolderReturnType {
  root: FolderType
  setRoot: (t: FolderType) => void
}

export interface FolderReturnType {
  tasks: Array<AnyTask>
  setTasks: (t: Array<AnyTask>) => void
  folder: FolderType
  setFolder: (f: FolderType) => void
  newTask: (name: string) => TaskType
  newFolder: (name: string) => FolderType
  newNote: (name: string) => NoteType
  expanded: Array<TaskId>
  setExpanded: (expanded: Array<TaskId>) => void
}

export interface TaskReturnType {
  task: TaskType
  setTask: (t: TaskType) => void
}

export interface NoteReturnType {
  note: NoteType
  setNote: (t: NoteType) => void
}

type ExpandedFoldersType = Array<{ id: TaskId; expanded: Array<TaskId> }>

interface TasksState {
  lastId: number
  tasks: FolderType
  expandedFolders: ExpandedFoldersType
}

type SetTasksHandler = (state: TasksState) => TasksState

interface TasksContextType {
  tasks: TasksState
  setTasks: (handler: SetTasksHandler) => void
}

export type TaskId = number

export interface FolderType {
  id: TaskId
  name: string
  tasks: Array<AnyTask>
  creationDate: string
  modificationDate: string
}

export interface TaskType {
  id: TaskId
  name: string
  status: boolean
  description: string
  creationDate: string
  modificationDate: string
}

export interface NoteType {
  id: TaskId
  name: string
  description: string
  creationDate: string
  modificationDate: string
}

export type AnyTask = FolderType | TaskType | NoteType
