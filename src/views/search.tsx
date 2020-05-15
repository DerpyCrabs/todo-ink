import Fuse from 'fuse.js'
import { Box, Color } from 'ink'
import { assoc, lensPath, view } from 'ramda'
import React from 'react'
import FullwidthBox from '../components/fullwidth-box'
import ScrollableList from '../components/scrollable-list'
import Select from '../components/select'
import { ControlledTextInput } from '../components/text-input'
import {
  isEnter,
  isLeave,
  isSelectNext,
  isSelectPrev,
} from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'
import { RouteProps, useRouter } from '../hooks/router'
import { NoteType, TaskId, useTasks } from '../hooks/tasks'
import type { FolderType, TaskType } from '../hooks/tasks'
import { folderPathString, isFolder, isNote, isTask, taskPath } from '../utils'

function flattenFolder(
  task: FolderType | TaskType | NoteType
): Array<(TaskType | FolderType | NoteType) & { path: string }> {
  if (isTask(task) || isNote(task)) {
    return [assoc('path', '', task)]
  }
  return [
    assoc('path', '', task),
    ...task.tasks
      .map(flattenFolder)
      .flat()
      .map((t) => assoc('path', `${task.name}/${t.path}`, t)),
  ]
}

export default function SearchView({ id }: { id: TaskId } & RouteProps) {
  const { root } = useTasks()
  const folder = view(lensPath(taskPath(root, id)), root) as FolderType
  const { go, back } = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')

  const makeSearcher = (folder: FolderType) =>
    new Fuse(
      flattenFolder(folder).map((task) => ({
        ...task,
        path: task.path.replace(/[^/]*\//, ''),
      })),
      {
        isCaseSensitive: false,
        threshold: 0.1,
        includeMatches: true,
        keys: ['name', 'path'],
      }
    )
  const [fuzzySearcher, setFuzzySearcher] = React.useState(() =>
    makeSearcher(folder)
  )

  React.useEffect(() => {
    setFuzzySearcher(makeSearcher(folder))
  }, [id, folder])

  const searchResults = fuzzySearcher.search(searchQuery)

  const [position, setPosition] = React.useState(null as number | null)
  React.useEffect(() => {
    setPosition(0)
  }, [fuzzySearcher, searchQuery])

  // prettier-ignore
  useHotkeys([
    [isSelectNext, () => {
        if (position !== null && position !== searchResults.length - 1) {
          setPosition(position + 1)
        }
      },],
    [isSelectPrev, () => {
        if (position !== null && position !== 0) {
          setPosition(position - 1)
        }
      },],
    [isLeave, () => {
      back()
      },],
    [isEnter, () => {
      if (position === null || searchResults.length === 0) return
      
      const task = searchResults[position].item
      if (isTask(task) || isNote(task)) {
        const path = taskPath(folder, task.id)
        
        const folderId = (view(lensPath(path.slice(0, -2)), folder) as FolderType).id
        go(`/folder/${folderId}/${task.id}`)
      } else if (isFolder(task)) {
        go(`/folder/${task.id}`)
      } else {
        throw new Error('Trying to go to unknown variant of task')
      }
      },],
    ], true)

  return (
    <Box flexDirection='column'>
      <ControlledTextInput
        prompt={`Search in /${folderPathString(root, taskPath(root, id))}: `}
        placeholder='search query'
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <ScrollableList position={position} margin={2}>
        {searchResults.map((res, i) => (
          <Select selected={i === position} key={i}>
            {(() => {
              const task = res.item
              if (isTask(task)) {
                return (
                  <FullwidthBox key={task.id}>
                    [{task.status ? 'X' : ' '}] <Task searchResult={res} />
                  </FullwidthBox>
                )
              } else if (isFolder(task)) {
                return (
                  <FullwidthBox key={task.id}>
                    [F] <Task searchResult={res} />
                  </FullwidthBox>
                )
              } else if (isNote(task)) {
                return (
                  <FullwidthBox key={task.id}>
                    [N] <Task searchResult={res} />
                  </FullwidthBox>
                )
              } else {
                return (
                  <FullwidthBox key={i}>Unknown variant of task</FullwidthBox>
                )
              }
            })()}
          </Select>
        ))}
      </ScrollableList>
    </Box>
  )
}

const Task = ({
  searchResult,
}: {
  searchResult: Fuse.FuseResult<
    (TaskType | FolderType | NoteType) & { path: string }
  >
}) => {
  const nameResult = searchResult.matches?.find((k) => k.key === 'name')
  const pathResult = searchResult.matches?.find((k) => k.key === 'path')
  if (isFolder(searchResult.item)) {
    return (
      <>
        {pathResult ? (
          <FuzzyResult result={pathResult} />
        ) : (
          searchResult.item.path
        )}
        {nameResult ? (
          <FuzzyResult result={nameResult} />
        ) : (
          searchResult.item.name
        )}
      </>
    )
  } else {
    return (
      <>
        {nameResult ? (
          <FuzzyResult result={nameResult} />
        ) : (
          searchResult.item.name
        )}
        :{' '}
        {pathResult ? (
          <FuzzyResult result={pathResult} />
        ) : (
          searchResult.item.path
        )}
      </>
    )
  }
}

const FuzzyResult = ({
  result,
}: {
  result: Fuse.FuseResultMatch | undefined
}) => {
  if (result === undefined || result.value === undefined) return null
  const isMatched = (i: number) => {
    for (const [start, end] of result.indices) {
      if (i >= start && i <= end) {
        return true
      }
    }
    return false
  }
  return (
    <>
      {Array.from(result.value).map((v: string, i: number) =>
        isMatched(i) ? <Color blue>{v}</Color> : v
      )}
    </>
  )
}
