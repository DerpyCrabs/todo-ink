import { Box, Text } from 'ink'
import React from 'react'
import FullwidthBox from '../components/fullwidth-box'
import ScrollableList from '../components/scrollable-list'
import Select from '../components/select'
import TaskBadge from '../components/task-badge'
import * as hotkeys from '../constants/hotkeys'
import useHotkeys from '../hooks/hotkeys'
import { RouteProps, useRouter } from '../hooks/router'
import { TaskId, useFolder } from '../hooks/tasks'
import { formatDate } from '../utils'

export default function Deleted({ id }: { id: TaskId } & RouteProps) {
  const { folder, deleted, restore } = useFolder(id)
  const [position, setPosition] = React.useState(null as null | number)
  const { back } = useRouter()

  React.useEffect(() => {
    if (deleted.length !== 0) {
      setPosition(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // prettier-ignore
  useHotkeys([
    [hotkeys.isSelectNext, () => {
        if (position !== null && position < deleted.length - 1) {
          setPosition(position + 1)
        }
      },],
    [hotkeys.isSelectPrev, () => {
        if (position !== null && position !== 0) {
          setPosition(position - 1)
        }
      },],
    [hotkeys.isLeave, () => {
      back()
      },],
    [hotkeys.isRestore, () => {
      if (position !== null) {
        setPosition(deleted.length !== 1 ? Math.max(0, position - 1) : null)
        restore(deleted[position].task.id)
      }
      },],
    ])

  return (
    <Box flexDirection='column'>
      <FullwidthBox>
        {'    '}Deleted tasks of folder: {folder.name}
      </FullwidthBox>
      <ScrollableList position={position} margin={3}>
        {deleted.map(({ task, deleted }, i) =>
          i === position ? (
            <FullwidthBox>
              <Select key={task.id} selected={true}>
                <TaskBadge task={task} />
                <Text> {`${task.name} (deleted ${formatDate(deleted)})`}</Text>
              </Select>
            </FullwidthBox>
          ) : (
            <FullwidthBox>
              <TaskBadge task={task} />
              <Text> {`${task.name} (deleted ${formatDate(deleted)})`}</Text>
            </FullwidthBox>
          )
        )}
      </ScrollableList>
    </Box>
  )
}
