import { zip } from 'ramda'
import { append, init, last } from 'ramda'
import React from 'react'
import useDebug from './debug'

interface RouterStateType {
  history: Array<string>
  path: string
}

interface RouterContextType {
  state: RouterStateType
  setState: React.Dispatch<React.SetStateAction<RouterStateType>>
}

const RouterContext = React.createContext<RouterContextType>({
  state: { history: [], path: '/' },
  setState: () => {},
})

const parsePath = (path: string) => {
  if (path === '/') {
    return ['/']
  }
  const parts = path.split('/').filter((p) => p !== '')
  return ['/' + parts[0], ...parts.slice(1)]
}

export const Router = ({
  children,
  initialPath = '/',
}: {
  children: React.ReactNode
  initialPath: string
}) => {
  const [state, setState] = React.useState({
    history: [],
    path: initialPath,
  } as RouterStateType)

  const debug = useDebug('router')

  const renderedChild = (() => {
    const path = parsePath(state.path)
    for (const child of React.Children.toArray(children)) {
      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        !('props' in child)
      )
        continue
      if (child.props.path !== undefined) {
        const childPath = parsePath(child.props.path)
        if (childPath[0] === path[0]) {
          if (childPath.length === 1) return child

          const props = Object.fromEntries(
            zip(
              childPath.slice(1).map((part) => part.slice(1)),
              path.slice(1).map((part) => JSON.parse(part))
            )
          )
          return React.cloneElement(child, props)
        }
      }
    }
    return null
  })()

  return (
    <RouterContext.Provider value={{ state, setState }}>
      {renderedChild}
    </RouterContext.Provider>
  )
}

export const useRouter = () => {
  const { setState } = React.useContext(RouterContext)
  return {
    back: () => {
      setState(({ history, path }) =>
        history.length !== 0
          ? {
              history: init(history),
              path: last(history) as string,
            }
          : { history, path }
      )
    },
    go: (path: string) => {
      setState(({ history, path: prevPath }) => ({
        history: append(prevPath, history),
        path,
      }))
    },
  }
}
