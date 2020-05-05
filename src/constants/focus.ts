import { TaskId } from '../hooks/tasks'

export default {
  root: { tag: 'root' },
  addingTask: (position?: number): AddingFocus => ({
    tag: 'addingTask',
    fallthrough: false,
    position: position,
  }),
  addingFolder: (position?: number): AddingFocus => ({
    tag: 'addingFolder',
    fallthrough: false,
    position: position,
  }),
  selectedTask: (id: number | null = null): FocusType => ({
    tag: 'selectedTask',
    id,
    fallthrough: true,
  }),
  editingTask: (id: null | number = null): FocusType => ({
    tag: 'editing',
    id,
    fallthrough: false,
  }),
  folder: (
    id: null | number = null,
    selected?: TaskId
  ): FocusType & { selected?: TaskId } => ({
    tag: 'folder',
    id,
    fallthrough: false,
    route: true,
    selected,
    omitted: ['selected'],
  }),
  task: (id: null | number = null): FocusType => ({
    tag: 'task',
    id,
    fallthrough: false,
    route: true,
  }),
  search: (id: null | number = null): FocusType => ({
    tag: 'search',
    id,
    fallthrough: false,
    route: true,
  }),
}

export interface FocusType {
  tag: string
  id?: number | null
  fallthrough: boolean
  route?: boolean
  omitted?: Array<string>
}

export interface AddingFocus extends FocusType {
  position?: number
}
