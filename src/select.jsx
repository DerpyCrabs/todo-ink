import { Color } from 'ink'

const Select = ({ selected, children }) => {
  if (selected) {
    return <Color green>{children}</Color>
  } else {
    return children
  }
}

export default Select
