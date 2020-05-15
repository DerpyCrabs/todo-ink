import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { FocusProvider } from './focus'
import { useRouter } from './router'

const wrapper = ({ children }) => (
  <FocusProvider initialFocus={[]}>{children}</FocusProvider>
)

test('useRouter is memoized', () => {
  const { result, rerender } = renderHook(() => useRouter(), {
    wrapper,
  })
  const firstResult = result.current
  rerender()
  const secondResult = result.current
  expect(firstResult).toEqual(secondResult)
})
