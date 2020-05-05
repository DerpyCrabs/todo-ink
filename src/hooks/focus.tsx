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

export function refocus(focus: Array<FocusType>, tag: FocusType) {
  if (focus.length !== 0 && focus[focus.length - 1].tag === tag.tag) {
    return append(tag, dropLast(1, focus))
  } else {
    return append(tag, focus)
  }
}

export function pushFocus(focus: Array<FocusType>, tag: FocusType) {
  return append(tag, focus)
}

export function popFocus(
  focus: Array<FocusType>,
  tag: FocusType['tag'] | FocusType
) {
  if (focus.length === 0) {
    throw new Error('Tried to popFocus from empty focus stack')
  } else {
    if (
      tag === undefined ||
      (typeof tag === 'string'
        ? (last(focus) as FocusType).tag === tag
        : equals(last(focus), tag))
    ) {
      return dropLast(1, focus)
    } else {
      return focus
    }
  }
}

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
      (tag: FocusType['tag'] | FocusType) => setFocus((f) => popFocus(f, tag)),
      [setFocus]
    ),
    pushFocus: React.useCallback(
      (tag: FocusType) => setFocus((f) => pushFocus(f, tag)),
      [setFocus]
    ),
    refocus: React.useCallback(
      (tag: FocusType) => {
        setFocus((f) => refocus(f, tag))
      },
      [setFocus]
    ),
  }
  return { focus, setFocus, ...actions }
}
