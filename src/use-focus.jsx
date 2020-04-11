import React from 'react'
import { append, dropLast, equals } from 'ramda'

const FocusContext = React.createContext()
export const FocusProvider = ({ children }) => {
  const [focus, setFocus] = React.useState([])
  return (
    <FocusContext.Provider value={{ focus, setFocus }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = (tag) => {
  const { focus, setFocus } = React.useContext(FocusContext)
  return {
    isFocused: (tag) =>
      typeof tag === 'string'
        ? focus[focus.length - 1].tag === tag
        : equals(tag, focus[focus.length - 1]),
    popFocus: () => setFocus((f) => dropLast(1, f)),
    pushFocus: (tag) => setFocus((f) => append(tag, f)),
    focus: (tag) => setFocus((f) => append(tag, dropLast(1, f))),
  }
}
