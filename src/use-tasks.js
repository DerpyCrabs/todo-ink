import { readFileSync, writeFileSync, existsSync } from 'fs'
import { useState } from 'react'

function readTasks(path) {
  if (existsSync(path)) {
    const content = readFileSync(path)
    return JSON.parse(content)
  } else {
    return []
  }
}

function writeTasks(path, tasks) {
  writeFileSync(path, JSON.stringify(tasks))
}

export default function useTasks(path) {
  const [tasks, setTasks] = useState(readTasks(path))
  const [lastId, setLastId] = useState(Math.max(0, ...tasks.map((t) => t.id)))
  const setTasksHandler = (tasks) => {
    writeTasks(path, tasks)
    setTasks(tasks)
  }
  const newTask = (name, status) => {
    setLastId(lastId + 1)
    return { id: lastId + 1, name, status }
  }
  return { tasks, setTasks: setTasksHandler, newTask }
}
