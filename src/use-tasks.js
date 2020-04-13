import { readFileSync, writeFileSync, existsSync } from 'fs'
import React from 'react'
import { lensPath, view, set, lensProp, compose } from 'ramda'

function readTasks(path) {
  if (existsSync(path)) {
    const content = readFileSync(path)
    return JSON.parse(content)
  } else {
    return { id: 0, name: 'root', tasks: [] }
  }
}

function writeTasks(path, tasks) {
  writeFileSync(path, JSON.stringify(tasks))
}

function maxId(tasks) {
  if (tasks.tasks === undefined) {
    return tasks.id
  }
  if (tasks.tasks.length === 0) {
    return tasks.id
  }
  return Math.max(tasks.id, ...tasks.tasks.map(maxId))
}

const TasksContext = React.createContext()
export const TasksProvider = ({ children, path = 'tasks.json' }) => {
  const tmpTasks = readTasks(path)
  const [tasks, setTasks] = React.useState({
    lastId: maxId(tmpTasks),
    tasks: tmpTasks,
  })
  const setTasksHandler = (tasksHandler) => {
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

const folderPath = (tasks, folderId) => {
  if (tasks.id === folderId) {
    return []
  }
  for (const [i, task] of tasks.tasks.entries()) {
    if (task.tasks !== undefined) {
      const ret = folderPath(task, folderId)
      if (ret !== null) {
        return ['tasks', i, ...ret]
      }
    }
  }
  return null
}

export function useTasks(folderId) {
  const {
    tasks: { tasks, lastId },
    setTasks,
  } = React.useContext(TasksContext)
  if (folderId === undefined) {
    return { folder: tasks }
  }
  const folderLens = lensPath(folderPath(tasks, folderId))
  const newTask = (name, status) => {
    setTasks(({ tasks, lastId }) => ({ tasks, lastId: lastId + 1 }))
    return { id: lastId + 1, name, status }
  }
  const newFolder = (name) => {
    setTasks(({ tasks, lastId }) => ({ tasks, lastId: lastId + 1 }))
    return { id: lastId + 1, name, tasks: [] }
  }
  const setTasksHandler = (t) => {
    setTasks(({ tasks, lastId }) => {
      return {
        tasks: set(compose(folderLens, lensProp('tasks')), t, tasks),
        lastId,
      }
    })
  }
  return {
    tasks: view(compose(folderLens, lensProp('tasks')), tasks),
    folder: view(folderLens, tasks),
    setTasks: setTasksHandler,
    newTask,
    newFolder,
  }
}
