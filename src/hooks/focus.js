import React from 'react'
import { append, dropLast, equals, reverse, last } from 'ramda'

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
  const actions = {
    isFocused: (tag) => {
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
    },
    popFocus: (tag) => {
      setFocus((f) => {
        if (
          tag === undefined ||
          (typeof tag === 'string' ? last(f).tag === tag : equals(last(f), tag))
        ) {
          return dropLast(1, f)
        } else {
          return f
        }
      })
    },
    pushFocus: (tag) => setFocus((f) => append(tag, f)),
    refocus: (tag) => {
      actions.popFocus(tag.tag)
      actions.pushFocus(tag)
    },
  }
  return { focus, ...actions }
}
