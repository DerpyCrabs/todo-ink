import { existsSync, readFileSync, writeFileSync } from 'fs'
import { compose, lensPath, lensProp, set, view } from 'ramda'
import type { Path, Lens } from 'ramda'
import React from 'react'

export interface FolderType {
  id: number
  name: string
  tasks: Array<FolderType | TaskType>
}
export interface TaskType {
  id: number
  name: string
  status: boolean
}

function readTasks(path: string) {
  if (existsSync(path)) {
    const content = readFileSync(path)
    const tasks = JSON.parse(content.toString())
    if (tasks.id === undefined) {
      return {
        id: Math.max(0, ...tasks.map((t: TaskType) => t.id)) + 1,
        name: 'root',
        tasks,
      }
    } else {
      return tasks
    }
  } else {
    return { id: 0, name: 'root', tasks: [] }
  }
}

function writeTasks(path: string, tasks: FolderType) {
  writeFileSync(path, JSON.stringify(tasks))
}

function maxId(tasks: FolderType | TaskType): FolderType['id'] {
  if ('status' in tasks) {
    return tasks.id
  }
  return Math.max(
    tasks.id,
    ...(tasks.tasks as Array<
      FolderType | TaskType
    >).map((t: FolderType | TaskType) => maxId(t))
  )
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

const TasksContext = React.createContext<TasksContextType>({
  tasks: { lastId: 0, tasks: { id: 0, name: 'root', tasks: [] } },
  setTasks: () => {},
})

export const TasksProvider = ({
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
  const setTasksHandler = (tasksHandler: SetTasksHandler) => {
    setTasks((tasks) => {
      const newTasks = tasksHandler(tasks)
      writeTasks(path, newTasks.tasks)
      return newTasks
    })
  }
  return (
    <TasksContext.Provider value={{ tasks, setTasks: setTasksHandler }}>
      {children}
    </TasksContext.Provider>
  )
}

export const taskPath = (
  tasks: FolderType | TaskType,
  taskId: TaskType['id']
): Path | null => {
  if (tasks.id === taskId) {
    return []
  } else if ('tasks' in tasks) {
    for (const [i, task] of tasks.tasks.entries()) {
      const ret = taskPath(task, taskId)
      if (ret !== null) {
        return ['tasks', i, ...ret]
      }
    }
  }
  return null
}

export interface RootFolderReturnType {
  folder: FolderType
  setFolder: (t: FolderType) => void
}

export interface FolderReturnType {
  tasks: Array<FolderType | TaskType>
  folder: FolderType
  setTasks: (t: Array<FolderType | TaskType>) => void
  newTask: (name: string, status: false) => TaskType
  newFolder: (name: string) => FolderType
}

export function useTasks(
  folderId?: FolderType['id']
): FolderReturnType | RootFolderReturnType {
  const {
    tasks: { tasks, lastId },
    setTasks,
  } = React.useContext(TasksContext)
  if (folderId === undefined) {
    return {
      folder: tasks,
      setFolder: (t: FolderType) =>
        setTasks(({ lastId }) => ({ tasks: t, lastId })),
    }
  }
  const folderPath = taskPath(tasks, folderId)
  if (folderPath === null) {
    throw new Error(`Couldn't find task with id = ${folderId}`)
  }
  const folderLens = lensPath(folderPath)
  const newTask = (name: string, status: boolean) => {
    setTasks(({ tasks, lastId }) => ({ tasks, lastId: lastId + 1 }))
    return { id: lastId + 1, name, status }
  }
  const newFolder = (name: string) => {
    setTasks(({ tasks, lastId }) => ({ tasks, lastId: lastId + 1 }))
    return { id: lastId + 1, name, tasks: [] }
  }
  const setTasksHandler = (t: Array<FolderType | TaskType>) => {
    setTasks(({ tasks, lastId }) => {
      return {
        tasks: set(compose(folderLens, lensProp('tasks')) as Lens, t, tasks),
        lastId,
      }
    })
  }
  return {
    tasks: view(compose(folderLens, lensProp('tasks')) as Lens, tasks),
    folder: view(folderLens, tasks),
    setTasks: setTasksHandler,
    newTask,
    newFolder,
  }
}
