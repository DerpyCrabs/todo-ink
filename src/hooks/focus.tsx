import { append, defaultTo, dropLast, equals, last, omit, reverse } from 'ramda'
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
// eslint-disable-next-line react/display-name
export const FocusProvider = React.memo(
  ({
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
)

export const useFocus = () => {
  const { focus, setFocus } = React.useContext(FocusContext)
  const actions = {
    isFocused: (tag: FocusType['tag'] | FocusType) => {
      if (focus.length === 0) return false

      const focused = []
      for (const f of reverse(focus)) {
        focused.push(f)
        if (f.fallthrough !== undefined && f.fallthrough === false) {
          break
        }
      }

      return (
        focused.find((f) =>
          typeof tag === 'string'
            ? f.tag === tag
            : equals(
                omit(append('omitted', defaultTo([], f.omitted)), f),
                omit(append('omitted', defaultTo([], f.omitted)), tag)
              )
        ) !== undefined
      )
    },
    popFocus: React.useCallback(
      (tag: FocusType['tag'] | FocusType) => {
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
      [setFocus]
    ),
    pushFocus: React.useCallback(
      (tag: FocusType) => setFocus((f) => append(tag, f)),
      [setFocus]
    ),
    refocus: React.useCallback(
      (tag: FocusType) => {
        setFocus((f: Array<FocusType>) => {
          if (f.length !== 0 && f[f.length - 1].tag === tag.tag) {
            return append(tag, dropLast(1, f))
          } else {
            return append(tag, f)
          }
        })
      },
      [setFocus]
    ),
  }
  return { focus, setFocus, ...actions }
}
