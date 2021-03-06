import Fuse from 'fuse.js'
import { Box, Text } from 'ink'
import { assoc, lensPath, view } from 'ramda'
import React from 'react'
import FullwidthBox from '../components/fullwidth-box'
import ScrollableList from '../components/scrollable-list'
import Select from '../components/select'
import TaskBadge from '../components/task-badge'
import { ControlledTextInput } from '../components/text-input'
import {
  isEnter,
  isLeave,
  isSelectNext,
  isSelectPrev,
} from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'
import { RouteProps, useRouter } from '../hooks/router'
import { TaskId, useTasks } from '../hooks/tasks'
import type { AnyTask, FolderType } from '../hooks/tasks'
import { folderPathString, isFolder, taskPath } from '../utils'

function flattenFolder(task: AnyTask): Array<AnyTask & { path: string }> {
  if (!isFolder(task)) {
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
      if (!isFolder(task)) {
        const path = taskPath(folder, task.id)
        
        const folderId = (view(lensPath(path.slice(0, -2)), folder) as FolderType).id
        go(`/folder/${folderId}/${task.id}`)
      } else if (isFolder(task)) {
        go(`/folder/${task.id}`)
      } else {
        throw new Error('Trying to go to unknown variant of task')
      }
      },],
    ])

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
          <FullwidthBox key={i}>
            <Select selected={i === position}>
              <Text>
                <TaskBadge task={res.item} /> <TaskName searchResult={res} />
              </Text>
            </Select>
          </FullwidthBox>
        ))}
      </ScrollableList>
    </Box>
  )
}

const TaskName = ({
  searchResult,
}: {
  searchResult: Fuse.FuseResult<AnyTask & { path: string }>
}) => {
  if (searchResult.matches === undefined) {
    return <Text>Undefined match</Text>
  }

  const nameResult = searchResult.matches.find((k) => k.key === 'name')
  const pathResult = searchResult.matches.find((k) => k.key === 'path')
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
    <Text>
      {Array.from(result.value).map((v: string, i: number) =>
        isMatched(i) ? (
          <Text color='blue' key={i}>
            {v}
          </Text>
        ) : (
          v
        )
      )}
    </Text>
  )
}
