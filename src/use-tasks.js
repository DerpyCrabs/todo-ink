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
  const setTasksHandler = (tasks) => {
    writeTasks(path, tasks)
    setTasks(tasks)
  }
  return [tasks, setTasksHandler]
}
