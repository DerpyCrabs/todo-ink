import React from 'react'
import { Box, useInput, useStdin } from 'ink'
import { useTasks } from './use-tasks'
import Task from './task'
import Folder from './folder'
import Select from './select'
import { UncontrolledTextInput } from './text-input'
import { FocusProvider, useFocus } from './use-focus'
import { remove, lensIndex, set, insert } from 'ramda'
import FOCUS from './focus'
import ScrollableList from './scrollable-list'
import { allTasksCount, completedTasksCount } from './folder'

const FolderView = ({ folder }) => {
  const { tasks, newTask, newFolder, setTasks } = useTasks(folder.id)
  const { isFocused, pushFocus, popFocus, focus, refocus } = useFocus()
  const selected = (() => {
    const last = focus[focus.length - 1]
    if (last.tag === 'task' || last.tag === 'editing') {
      const index = tasks.findIndex((t) => t.id === last.id)
      if (index !== -1) {
        return index
      } else {
        return null
      }
    } else {
      return null
    }
  })()

  React.useEffect(() => {
    if (tasks.length !== 0 && !isFocused(FOCUS.task().tag)) {
      pushFocus(FOCUS.task(tasks[0].id))
    }
  }, [folder.id])

  const taskChangeHandler = (task, i) => {
    setTasks(set(lensIndex(i), task, tasks))
  }

  const newTaskHandler = (v, i) => {
    popFocus(FOCUS.addingTask().tag)
    if (v.trim()) {
      const task = newTask(v, false)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.task(task.id))
    }
  }
  const newFolderHandler = (v, i) => {
    popFocus(FOCUS.addingFolder().tag)
    if (v.trim()) {
      const task = newFolder(v)
      setTasks(insert(i, task, tasks))
      refocus(FOCUS.task(task.id))
    }
  }

  const newTaskCancelHandler = () => {
    popFocus(FOCUS.addingTask().tag)
  }
  const newFolderCancelHandler = () => {
    popFocus(FOCUS.addingFolder().tag)
  }

  useInput((input, key) => {
    if (isFocused(FOCUS.folder(folder.id, folder.name))) {
      if (key.downArrow) {
        if (selected !== null && selected !== tasks.length - 1) {
          refocus(FOCUS.task(tasks[selected + 1].id))
        }
      } else if (key.upArrow) {
        if (selected !== null && selected !== 0) {
          refocus(FOCUS.task(tasks[selected - 1].id))
        }
      } else if (input === 'j') {
        if (selected < tasks.length - 1) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected + 1]] = [tc[selected + 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.task(tc[selected + 1].id))
        }
      } else if (input === 'k') {
        if (selected > 0) {
          let tc = tasks.slice()
          ;[tc[selected], tc[selected - 1]] = [tc[selected - 1], tc[selected]]
          setTasks(tc)
          refocus(FOCUS.task(tc[selected - 1].id))
        }
      } else if (input === 'd') {
        if (selected !== null) {
          setTasks(remove(selected, 1, tasks))
          popFocus(FOCUS.task().tag)
          if (tasks.length !== 1) {
            const newSelected =
              tasks.length - 1 === selected
                ? Math.max(0, selected - 1)
                : selected
            pushFocus(FOCUS.task(remove(selected, 1, tasks)[newSelected].id))
          }
        }
      } else if (input === 'n') {
        pushFocus(FOCUS.addingTask(selected))
      } else if (input === 'f') {
        pushFocus(FOCUS.addingFolder(selected))
      } else if (key.leftArrow || key.escape) {
        if (focus.length !== 2) {
          popFocus(FOCUS.task().tag)
          popFocus(FOCUS.folder().tag)
        }
      }
    }
  })

  return (
    <Box flexDirection='column'>
      <Box>
        {'    '}Folder: {folderPath(focus)} ({completedTasksCount(tasks)}/
        {allTasksCount(tasks)})
      </Box>
      <ScrollableList
        position={
          (selected === null || tasks.length === 0
            ? 0
            : isFocused(FOCUS.addingTask().tag)) ||
          isFocused(FOCUS.addingFolder().tag)
            ? selected + 1
            : selected
        }
        margin={3}
      >
        {tasks.map((task, i) => (
          <React.Fragment key={i}>
            {task.tasks === undefined ? (
              <Task task={task} onChange={(t) => taskChangeHandler(t, i)} />
            ) : (
              <Folder task={task} onChange={(t) => taskChangeHandler(t, i)} />
            )}
            {isFocused(FOCUS.addingTask(i)) && (
              <Select selected={true}>
                <UncontrolledTextInput
                  prompt='> '
                  onSubmit={(v) => newTaskHandler(v, i + 1)}
                  onCancel={newTaskCancelHandler}
                />
              </Select>
            )}
            {isFocused(FOCUS.addingFolder(i)) && (
              <Select selected={true}>
                <UncontrolledTextInput
                  prompt='[F] > '
                  onSubmit={(v) => newFolderHandler(v, i + 1)}
                  onCancel={newFolderCancelHandler}
                />
              </Select>
            )}
          </React.Fragment>
        ))}
        {isFocused(FOCUS.addingTask(null)) && (
          <Select selected={true}>
            <UncontrolledTextInput
              prompt='> '
              onSubmit={(v) => newTaskHandler(v, 0)}
              onCancel={newTaskCancelHandler}
            />
          </Select>
        )}
        {isFocused(FOCUS.addingFolder(null)) && (
          <Select selected={true}>
            <UncontrolledTextInput
              prompt='[F] > '
              onSubmit={(v) => newFolderHandler(v, 0)}
              onCancel={newFolderCancelHandler}
            />
          </Select>
        )}
      </ScrollableList>
    </Box>
  )
}

function folderPath(focus) {
  const folders = focus
    .filter((f) => f.tag === FOCUS.folder().tag)
    .map((f) => f.name)
  return '/' + folders.slice(1).join('/')
}

export default FolderView
