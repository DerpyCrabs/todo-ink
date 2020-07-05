import { useStdout } from 'ink'
import { Path, lensPath, scan, splitEvery, view } from 'ramda'
import React from 'react'
import { FolderType, NoteType, TaskId, TaskType } from './hooks/tasks'

export const isTask = (t: FolderType | TaskType | NoteType): t is TaskType => {
  return 'status' in t
}

export const isFolder = (
  t: FolderType | TaskType | NoteType
): t is FolderType => {
  return 'tasks' in t
}

export const isNote = (t: FolderType | TaskType | NoteType): t is NoteType => {
  return !(isTask(t) || isFolder(t))
}

export const folderPathString = (
  folder: FolderType,
  folderPath: Array<string | number>
) => {
  const folderPaths = scan(
    (acc, elem: Array<string | number>) => [...acc, ...elem],
    [],
    splitEvery(2, folderPath)
  )
  const folderNames = folderPaths
    .slice(1)
    .map((path) => (view(lensPath(path), folder) as FolderType).name)
  return folderNames.join('/')
}

export const taskPath = (
  tasks: FolderType | TaskType | NoteType,
  taskId: TaskId
): Path => {
  const taskPathImpl = (
    tasks: FolderType | TaskType | NoteType
  ): Path | null => {
    if (tasks.id === taskId) {
      return []
    } else if (isFolder(tasks)) {
      for (const [i, task] of tasks.tasks.entries()) {
        const ret = taskPathImpl(task)
        if (ret !== null) {
          return ['tasks', i, ...ret]
        }
      }
    }
    return null
  }

  const path = taskPathImpl(tasks)
  if (path === null) {
    throw new Error(`Cannot find task with id ${taskId}`)
  }
  return path
}

export const useStdoutSize = (): { rows: number; columns: number } => {
  const { stdout } = useStdout()

  if (stdout === undefined) throw new Error('Failed to fetch stdout size')

  const [size, setSize] = React.useState({
    columns: stdout.columns,
    rows: stdout.rows,
  })

  React.useEffect(() => {
    const handler = () =>
      setSize({ columns: stdout.columns, rows: stdout.rows })
    stdout.on('resize', handler)
    return () => {
      stdout.off('resize', handler)
    }
  }, [stdout, stdout.columns, stdout.rows])

  return size
}

export function allTasksCount(
  tasks: Array<FolderType | TaskType | NoteType>
): number {
  return tasks.filter(
    (t) => isTask(t) || (isFolder(t) && allTasksCount(t.tasks) !== 0)
  ).length
}

export function completedTasksCount(
  tasks: Array<FolderType | TaskType | NoteType>
): number {
  let count = 0
  for (const task of tasks) {
    if (isTask(task)) {
      if (task.status) {
        count += 1
      }
    } else if (isFolder(task)) {
      if (
        completedTasksCount(task.tasks) === allTasksCount(task.tasks) &&
        allTasksCount(task.tasks) !== 0
      ) {
        count += 1
      }
    }
  }
  return count
}
