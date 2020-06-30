import { Text } from 'ink'
import React from 'react'

const Select = ({
  selected,
  children,
}: {
  children: React.ReactNode
  selected: boolean
}) => {
  if (selected) {
    return (
      <Text color='green' wrap='truncate-end'>
        {process.env.NODE_ENV === 'test' ? '[f]' : ''}
        {children}
      </Text>
    )
  } else {
    return <Text wrap='truncate-end'>{children}</Text>
  }
}

export default Select
