import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { ClipboardProvider, useClipboard } from './clipboard'
import { FocusProvider } from './focus'
import { TasksProvider } from './tasks'

const wrapper = ({ children }) => (
  <TasksProvider path='test-assets/tasks.json'>
    <FocusProvider initialFocus={[]}>
      <ClipboardProvider>{children}</ClipboardProvider>
    </FocusProvider>
  </TasksProvider>
)

test('useClipboard is memoized', () => {
  const { result, rerender } = renderHook(() => useClipboard(), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})
