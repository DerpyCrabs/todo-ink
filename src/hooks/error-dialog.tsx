import { Box, Text, useApp } from 'ink'
import React from 'react'
import { isErrorIgnore, isErrorQuit } from '../constants/hotkeys'
import { useStdoutSize } from '../utils'
import useHotkeys from './hotkeys'

interface ErrorDialogContextType {
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
}
const ErrorDialogContext = React.createContext<ErrorDialogContextType>({
  error: null,
  setError: () => {},
})

function ErrorDialog({ error, ignore }: { error: string; ignore: () => void }) {
  const { exit } = useApp()
  useHotkeys([
    [isErrorQuit, exit],
    [isErrorIgnore, ignore],
  ])

  return (
    <Box
      borderStyle='bold'
      borderColor='red'
      flexDirection='column'
      paddingX={3}
    >
      <Box padding={1} paddingX={3} flexGrow={1} justifyContent='center'>
        <Text>{error}</Text>
      </Box>
      <Box justifyContent='space-around'>
        <Box borderStyle='single' flexBasis='20%' justifyContent='center'>
          <Text>(I)gnore</Text>
        </Box>
        <Box flexBasis={3} />
        <Box borderStyle='single' flexBasis='20%' justifyContent='center'>
          <Text>(Q)uit</Text>
        </Box>
      </Box>
    </Box>
  )
}

export function ErrorDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [error, setError] = React.useState(null as string | null)
  const { columns } = useStdoutSize()

  if (error !== null) {
    return (
      <Box alignItems='center' justifyContent='center' padding={3}>
        <Box width={Math.min(70, columns)} justifyContent='center'>
          <ErrorDialog error={error} ignore={() => setError(null)} />
        </Box>
      </Box>
    )
  }

  return (
    <ErrorDialogContext.Provider value={{ error, setError }}>
      {children}
    </ErrorDialogContext.Provider>
  )
}

export function useErrorDialog() {
  const { setError } = React.useContext(ErrorDialogContext)
  return { showError: setError }
}
