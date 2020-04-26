import { append, dropLast, equals, last, reverse } from 'ramda'
import React from 'react'
import type { FocusType } from '../constants/focus'

interface FocusContextType {
  focus: Array<FocusType>
  setFocus: React.Dispatch<React.SetStateAction<Array<FocusType>>>
}
const FocusContext = React.createContext<FocusContextType>({
  focus: [],
  setFocus: () => {},
})
export const FocusProvider = ({
  children,
  initialFocus = [],
}: {
  children: React.ReactNode
  initialFocus: Array<FocusType>
}) => {
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
    isFocused: (tag: FocusType['tag'] | FocusType) => {
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
    popFocus: (tag: FocusType['tag'] | FocusType) => {
      setFocus((f: Array<FocusType>) => {
        if (f.length === 0) {
          throw new Error('Tried to popFocus from empty focus stack')
        } else {
          if (
            tag === undefined ||
            (typeof tag === 'string'
              ? (last(f) as FocusType).tag === tag
              : equals(last(f), tag))
          ) {
            return dropLast(1, f)
          } else {
            return f
          }
        }
      })
    },
    pushFocus: (tag: FocusType) => setFocus((f) => append(tag, f)),
    refocus: (tag: FocusType) => {
      actions.popFocus(tag.tag)
      actions.pushFocus(tag)
    },
  }
  return { focus, ...actions }
}
