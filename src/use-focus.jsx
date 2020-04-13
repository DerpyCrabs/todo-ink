import React from 'react'
import { append, dropLast, equals, reverse, takeWhile, prepend } from 'ramda'

const FocusContext = React.createContext()
export const FocusProvider = ({ children, initialFocus = [] }) => {
  const [focus, setFocus] = React.useState(initialFocus)
  return (
    <FocusContext.Provider value={{ focus, setFocus }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const { focus, setFocus } = React.useContext(FocusContext)
  const isFocused = (tag) => {
    if (focus.length === 0) return false
    let focused = []
    for (const f of reverse(focus)) {
      focused.push(f)
      if (f.fallthrough !== undefined && f.fallthrough === false) {
        break
      }
    }
    return (
      focused.find((f) =>
        typeof tag === 'string' ? f.tag === tag : equals(f, tag)
      ) !== undefined
    )
  }
  const popFocus = (tag) => {
    setFocus((f) => {
      if (
        tag === undefined ||
        (typeof tag === 'string'
          ? f[f.length - 1].tag === tag
          : equals(f[f.length - 1], tag))
      ) {
        return dropLast(1, f)
      } else {
        return f
      }
    })
  }
  const pushFocus = (tag) => setFocus((f) => append(tag, f))
  return {
    focus,
    isFocused,
    popFocus,
    pushFocus,
    refocus: (tag) => {
      popFocus(tag.tag)
      pushFocus(tag)
    },
  }
}
