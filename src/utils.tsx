import { useStdout } from 'ink'
import { Path, lensPath, scan, splitEvery, sum, view } from 'ramda'
import React from 'react'
import { FolderType, TaskId, TaskType } from './hooks/tasks'

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
  tasks: FolderType | TaskType,
  taskId: TaskId
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

export const useStdoutSize = (): { rows: number; columns: number } => {
  const { stdout } = useStdout()
  if (stdout === undefined) {
    return { rows: 0, columns: 0 }
  }
  const [size, setSize] = React.useState({
    columns: stdout.columns,
    rows: stdout.rows,
  })

  React.useEffect(() => {
    const handler = () =>
      setSize({ columns: stdout.columns, rows: stdout.rows })
    stdout?.on('resize', handler)
    return () => {
      stdout?.off('resize', handler)
    }
  }, [stdout, stdout?.columns, stdout?.rows])

  return size
}

export function completedTasksCount(
  tasks: Array<FolderType | TaskType>
): number {
  return sum(
    tasks.map((task) =>
      'tasks' in task ? completedTasksCount(task.tasks) : task.status ? 1 : 0
    )
  )
}

export function allTasksCount(tasks: Array<FolderType | TaskType>): number {
  return sum(
    tasks.map((task) => ('tasks' in task ? allTasksCount(task.tasks) : 1))
  )
}
