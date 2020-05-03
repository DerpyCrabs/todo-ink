import { dropLastWhile, init, last, pick } from 'ramda'
import React from 'react'
import FOCUS from '../constants/focus'
import { useFocus } from '../hooks/focus'
import { TaskType } from './tasks'

const parsePath = (path: string) => {
  const parts = path.split('/').filter((p) => p !== '')
  return parts
}

export type RouteProps = { path: string } & any

export const Router = ({ children }: { children: React.ReactNode }) => {
  const { focus } = useFocus()

  const renderedChild = (() => {
    const currentRoute = last(focus.filter((f) => f.route === true))
    let fallbackChild = null

    for (const child of React.Children.toArray(children)) {
      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        !('props' in child)
      )
        continue
      if (child.props.path !== undefined) {
        if (child.props.path === '/') {
          fallbackChild = child
        }

        const childPath = parsePath(child.props.path)

        if (currentRoute !== undefined) {
          if (childPath[0] === currentRoute.tag) {
            if (childPath.length === 1) return child

            return React.cloneElement(
              child,
              pick(
                childPath.slice(1).map((t) => t.slice(1)),
                currentRoute
              )
            )
          }
        }
      }
    }
    return fallbackChild
  })()

  return renderedChild
}

export const useRouter = () => {
  const { pushFocus, setFocus } = useFocus()
  return {
    back: () => {
      setFocus((f) => {
        const previousRoute = init(dropLastWhile((t) => t.route !== true, f))
        if (previousRoute !== undefined && previousRoute.length !== 0) {
          return previousRoute
        } else {
          return f
        }
      })
    },
    go: (path: string) => {
      const parsedPath = parsePath(path)
      pushFocus(
        (FOCUS as any)[parsedPath[0]](
          ...parsedPath.slice(1).map((p) => JSON.parse(p))
        )
      )
    },
  }
}
