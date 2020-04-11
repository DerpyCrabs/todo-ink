import React from 'react'

const FocusContext = React.createContext()
export const FocusProvider = ({ children, initialFocus }) => {
  const [focus, setFocus] = React.useState([initialFocus])
  return (
    <FocusContext.Provider value={{ focus, setFocus }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = (tag) => {
  const { focus, setFocus } = React.useContext(FocusContext)
  return [
    focus,
    {
      isFocused: (tag) => tag === focus[focus.length - 1],
      popFocus: () => setFocus((f) => f.slice(0, f.length - 1)),
      pushFocus: (tag) => setFocus((f) => [...f, tag]),
    },
  ]
}
