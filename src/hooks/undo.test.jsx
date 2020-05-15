import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TasksProvider } from './tasks'
import useUndo from './undo'

const wrapper = ({ children }) => (
  <TasksProvider path='test-assets/tasks.json'>{children}</TasksProvider>
)

test('useUndo is memoized', () => {
  const { result, rerender } = renderHook(() => useUndo(), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})
