import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TasksProvider, useFolder, useNote, useTask, useTasks } from './tasks'

const wrapper = ({ children }) => (
  <TasksProvider path='test-assets/tasks.json'>{children}</TasksProvider>
)

test('useTasks is memoized', () => {
  const { result, rerender } = renderHook(() => useTasks(), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})

test('useFolder is memoized', () => {
  const { result, rerender } = renderHook(() => useFolder(1), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})

test('useTask is memoized', () => {
  const { result, rerender } = renderHook(() => useTask(2), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})

test('useNote is memoized', () => {
  const { result, rerender } = renderHook(() => useNote(3), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})
