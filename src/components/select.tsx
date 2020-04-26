import { Color } from 'ink'
import React from 'react'

const Select = ({
  selected,
  children,
}: {
  children: React.ReactNode
  selected: boolean
}): React.ReactElement => {
  if (selected) {
    return <Color green>{children}</Color>
  } else {
    return <>{children}</>
  }
}

export default Select
