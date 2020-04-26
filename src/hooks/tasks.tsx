import { existsSync, readFileSync, writeFileSync } from 'fs'
import { compose, lensPath, lensProp, set, view } from 'ramda'
import type { Path, Lens } from 'ramda'
import React from 'react'

export interface Task {
  id: number
  name: string
  status?: boolean
  tasks?: [Task] | []
}

function readTasks(path: string) {
  if (existsSync(path)) {
    const content = readFileSync(path)
    const tasks = JSON.parse(content.toString())
    if (tasks.id === undefined) {
      return {
        id: Math.max(0, ...tasks.map((t: Task) => t.id)) + 1,
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

function writeTasks(path: string, tasks: Task) {
  writeFileSync(path, JSON.stringify(tasks))
}

function maxId(tasks: Task): Task['id'] {
  if (tasks.tasks === undefined) {
    return tasks.id
  }
  return Math.max(
    tasks.id,
    ...(tasks.tasks as [Task]).map((t: Task) => maxId(t))
  )
}

interface TasksState {
  lastId: number
  tasks: Task
}

type SetTasksHandler = (state: TasksState) => TasksState
interface TasksContextType {
  tasks: TasksState
  setTasks: (handler: SetTasksHandler) => void
}

const TasksContext = React.createContext<TasksContextType>({
  tasks: { lastId: 0, tasks: { id: 0, name: 'root' } },
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

export const taskPath = (tasks: Task, taskId: Task['id']): Path | null => {
  if (tasks.id === taskId) {
    return []
  } else if (tasks.tasks !== undefined) {
    for (const [i, task] of tasks.tasks.entries()) {
      const ret = taskPath(task, taskId)
      if (ret !== null) {
        return ['tasks', i, ...ret]
      }
    }
  }
  return null
}

export interface RootTaskReturnType {
  folder: Task
  setFolder: (t: Task) => void
}

export interface TaskReturnType {
  tasks: Task
  folder: Task
  setTasks: (t: Task) => void
  newTask: (name: string, status: false) => Task
  newFolder: (name: string) => Task
}
export function useTasks(
  folderId?: Task['id']
): TaskReturnType | RootTaskReturnType {
  const {
    tasks: { tasks, lastId },
    setTasks,
  } = React.useContext(TasksContext)
  if (folderId === undefined) {
    return {
      folder: tasks,
      setFolder: (t: Task) => setTasks(({ lastId }) => ({ tasks: t, lastId })),
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
    return { id: lastId + 1, name, tasks: [] as [] }
  }
  const setTasksHandler = (t: Task) => {
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
