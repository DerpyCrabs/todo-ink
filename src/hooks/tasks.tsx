import { existsSync, readFileSync, writeFileSync } from 'fs'
import { compose, equals, lensPath, lensProp, set, view } from 'ramda'
import type { Lens } from 'ramda'
import React from 'react'
import { isNote, isTask, taskPath } from '../utils'

function readTasks(path: string) {
  const addDates = (
    task: FolderType | TaskType | NoteType
  ): FolderType | TaskType | NoteType => {
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
      return { ...task, tasks: task.tasks.map((t) => addDates(t)) }
    }
  }
  if (existsSync(path)) {
    const content = readFileSync(path)
    const tasks = JSON.parse(content.toString())
    if (tasks.id === undefined) {
      return {
        id: Math.max(0, ...tasks.map((t: TaskType) => t.id)) + 1,
        name: 'root',
        tasks: tasks.map((t: NoteType | FolderType | TaskType) => addDates(t)),
      }
    } else {
      return {
        ...tasks,
        tasks: tasks.tasks.map((t: NoteType | FolderType | TaskType) =>
          addDates(t)
        ),
      }
    }
  } else {
    return { id: 0, name: 'root', tasks: [] }
  }
}

function writeTasks(path: string, tasks: FolderType) {
  writeFileSync(path, JSON.stringify(tasks))
}

function maxId(tasks: FolderType | TaskType | NoteType): TaskId {
  if (isTask(tasks) || isNote(tasks)) {
    return tasks.id
  }
  return Math.max(
    tasks.id,
    ...(tasks.tasks as Array<
      FolderType | TaskType | NoteType
    >).map((t: FolderType | TaskType | NoteType) => maxId(t))
  )
}

const TasksContext = React.createContext<TasksContextType>({
  tasks: { lastId: 0, tasks: { id: 0, name: 'root', tasks: [] } },
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
  const taskLens = React.useMemo(() => lensPath(path), [path])

  const setTaskHandler = React.useCallback(
    (t: TaskType) => {
      setTasks(({ tasks, lastId }) => {
        if (!equals(t, view(taskLens, tasks))) {
          return {
            tasks: set(
              taskLens,
              { ...t, modificationDate: new Date().toJSON() },
              tasks
            ),
            lastId,
          }
        } else {
          return { tasks, lastId }
        }
      })
    },
    [setTasks, taskLens]
  )

  return {
    task: view(taskLens, tasks),
    setTask: setTaskHandler,
  }
}

export function useNote(taskId: TaskId): NoteReturnType {
  const {
    tasks: { tasks },
    setTasks,
  } = React.useContext(TasksContext)

  const path = React.useMemo(() => taskPath(tasks, taskId), [tasks, taskId])
  const noteLens = React.useMemo(() => lensPath(path), [path])

  const setNoteHandler = React.useCallback(
    (n: NoteType) => {
      setTasks(({ tasks, lastId }) => {
        if (!equals(n, view(noteLens, tasks))) {
          return {
            tasks: set(
              noteLens,
              { ...n, modificationDate: new Date().toJSON() },
              tasks
            ),
            lastId,
          }
        } else {
          return { tasks, lastId }
        }
      })
    },
    [setTasks, noteLens]
  )

  return {
    note: view(noteLens, tasks),
    setNote: setNoteHandler,
  }
}

export function useTasks(): RootFolderReturnType {
  const {
    tasks: { tasks },
    setTasks,
  } = React.useContext(TasksContext)
  const setRoot = React.useCallback(
    (t: FolderType) => setTasks(({ lastId }) => ({ tasks: t, lastId })),
    [setTasks]
  )
  return {
    root: tasks,
    setRoot,
  }
}

export function useFolder(folderId: TaskId): FolderReturnType {
  const {
    tasks: { tasks, lastId },
    setTasks,
  } = React.useContext(TasksContext)

  const folderPath = React.useMemo(() => taskPath(tasks, folderId), [
    tasks,
    folderId,
  ])
  const folderLens = React.useMemo(() => lensPath(folderPath), [folderPath])

  const newTask = React.useCallback(
    (name: string, status: boolean) => {
      setTasks(({ tasks, lastId }) => ({ tasks, lastId: lastId + 1 }))
      return {
        id: lastId + 1,
        name,
        status,
        description: '',
        creationDate: new Date().toJSON(),
        modificationDate: new Date().toJSON(),
      }
    },
    [lastId, setTasks]
  )

  const newFolder = React.useCallback(
    (name: string) => {
      setTasks(({ tasks, lastId }) => ({ tasks, lastId: lastId + 1 }))
      return { id: lastId + 1, name, tasks: [] }
    },
    [lastId, setTasks]
  )

  const newNote = React.useCallback(
    (name: string) => {
      setTasks(({ tasks, lastId }) => ({ tasks, lastId: lastId + 1 }))
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

  const setTasksHandler = React.useCallback(
    (newTasks: Array<FolderType | TaskType | NoteType>) => {
      setTasks(({ tasks, lastId }) => {
        const oldTasks = view(
          compose(folderLens, lensProp('tasks')) as Lens,
          tasks
        ) as Array<FolderType | TaskType | NoteType>
        const updatedTasks = newTasks.map((task) => {
          const oldTask = oldTasks.find((t) => t.id === task.id)
          if (
            oldTask !== undefined &&
            (isNote(task) || isTask(task)) &&
            !equals(oldTask, task)
          ) {
            return { ...task, modificationDate: new Date().toJSON() }
          } else {
            return task
          }
        })
        return {
          tasks: set(
            compose(folderLens, lensProp('tasks')) as Lens,
            updatedTasks,
            tasks
          ),
          lastId,
        }
      })
    },
    [folderLens, setTasks]
  )

  return {
    tasks: view(compose(folderLens, lensProp('tasks')) as Lens, tasks),
    folder: view(folderLens, tasks),
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
  tasks: Array<FolderType | TaskType | NoteType>
  setTasks: (t: Array<FolderType | TaskType | NoteType>) => void
  folder: FolderType
  newTask: (name: string, status: false) => TaskType
  newFolder: (name: string) => FolderType
  newNote: (name: string) => NoteType
}

export interface TaskReturnType {
  task: TaskType
  setTask: (t: TaskType) => void
}

export interface NoteReturnType {
  note: NoteType
  setNote: (t: NoteType) => void
}

interface TasksState {
  lastId: number
  tasks: FolderType
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
  tasks: Array<FolderType | TaskType | NoteType>
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
