import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { FocusProvider, useFocus } from './focus'

const wrapper = ({ children }) => (
  <FocusProvider initialFocus={[]}>{children}</FocusProvider>
)

test('useFocus is memoized', () => {
  const { result, rerender } = renderHook(() => useFocus(), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})
